"""FutureLite AI integrated MQTT console.

P1: Soil raw telemetry
P2: LED controlled by local A button or website command
M2: Fan controlled locally by B button only
M:  Cycle live, network and web-command pages
"""

import time
import random
import socket

try:
    import ujson as json
except ImportError:
    import json

from future import *
from screen import Screen
from sensor import Sensor
from uwifi import WIFI


BROKER = "broker.emqx.io"
MQTT_PORT = 1883
PREFIX = "hksteam/demo/fla-7q4m9c2p"
TOPIC_STATUS = PREFIX + "/status"
TOPIC_SOIL = PREFIX + "/telemetry/soil"
TOPIC_BUTTON = PREFIX + "/event/button"
TOPIC_LED_COMMAND = PREFIX + "/cmd/led"
TOPIC_ACK = PREFIX + "/ack"

PUBLISH_INTERVAL = 2.0
DISPLAY_INTERVAL = 0.35
DEBOUNCE_SECONDS = 0.25
RETRY_SECONDS = 3
FAN_SPEED = 50
PROGRAM_VERSION = "2026.07.15-r2"

BLACK = (0, 0, 0)
WHITE = (245, 250, 255)
CYAN = (70, 220, 245)
GREEN = (55, 225, 165)
AMBER = (255, 190, 70)
RED = (255, 90, 100)
MUTED = (120, 150, 165)


wifi = WIFI()
screen = Screen()
buttons = Sensor()
soil_pin = MeowPin("P1", "ANALOG")
led_pin = MeowPin("P2", "OUT")
motor = Motor()

try:
    screen.init()
except Exception:
    pass

screen.autoRefresh(False)

client_id = "futurelite-" + str(random.getrandbits(24))
seq = 0
page = 0
soil_raw = None
led_on = False
fan_on = False
button_a_count = 0
button_b_count = 0
tx_count = 0
rx_count = 0
reconnect_count = 0

wifi_ok = False
dns_ok = False
tcp_ok = False
mqtt_ok = False
sub_ok = False
pub_ok = False

last_error = ""
last_command_id = ""
last_command_on = None
last_command_at = None
last_ack = "--"
last_led_source = "BOOT"

previous_a = False
previous_b = False
previous_m = False
last_a_at = -10.0
last_b_at = -10.0
last_m_at = -10.0


def next_seq():
    global seq
    seq += 1
    return seq


def safe_error(error):
    text = str(error).replace("\n", " ")
    return text[:24]


def status_word(value):
    return "OK" if value else "FAIL"


def set_led(on, source):
    global led_on, last_led_source
    led_pin.setDigital(1 if on else 0)
    led_on = bool(on)
    last_led_source = source


def set_fan(on):
    global fan_on
    if on:
        motor.setSpeed(2, FAN_SPEED, 0)
        fan_on = True
    else:
        motor.stopMotor(2)
        fan_on = False


def publish_json(topic, value):
    global tx_count, pub_ok
    payload = json.dumps(value)
    wifi.publish(topic, payload)
    print("PUB", topic, payload)
    tx_count += 1
    pub_ok = True


def publish_button(name):
    publish_json(TOPIC_BUTTON, {"button": name, "seq": next_seq()})


def normalize_message(message):
    if message is None:
        return None
    if isinstance(message, bytes):
        return message.decode("utf-8")
    if isinstance(message, dict):
        if "payload" in message:
            return normalize_message(message["payload"])
        return json.dumps(message)
    if isinstance(message, (list, tuple)):
        if not message:
            return None
        return normalize_message(message[-1])
    return str(message)


def send_ack(command_id, ok, on=None, error=None):
    payload = {"id": command_id, "ok": bool(ok)}
    if on is not None:
        payload["on"] = bool(on)
    if error:
        payload["error"] = safe_error(error)
    publish_json(TOPIC_ACK, payload)


def handle_led_command(message):
    global rx_count, last_command_id, last_command_on
    global last_command_at, last_ack, last_error

    payload = normalize_message(message)
    if not payload:
        return

    rx_count += 1
    print("RX", TOPIC_LED_COMMAND, payload)
    command_id = ""
    try:
        command = json.loads(payload)
        command_id = command.get("id", "")
        command_on = command.get("on", None)
        if not isinstance(command_id, str) or not command_id:
            raise ValueError("missing id")
        if not isinstance(command_on, bool):
            raise ValueError("on must be boolean")

        # A repeated command is not executed twice, but its ACK is repeated.
        if command_id != last_command_id:
            set_led(command_on, "WEB")

        last_command_id = command_id
        last_command_on = command_on
        last_command_at = time.monotonic()
        send_ack(command_id, True, command_on)
        print("ACK", command_id, command_on)
        last_ack = "OK"
        last_error = ""
    except Exception as error:
        last_error = safe_error(error)
        print("CMD_ERROR", last_error)
        last_ack = "ERR"
        if command_id:
            try:
                send_ack(command_id, False, error=last_error)
            except Exception:
                pass


def network_probe():
    global wifi_ok, dns_ok, tcp_ok, last_error

    wifi_ok = bool(wifi.isconnect())
    dns_ok = False
    tcp_ok = False
    if not wifi_ok:
        return

    probe = None
    try:
        address = socket.getaddrinfo(BROKER, MQTT_PORT)[0][-1]
        dns_ok = True
        probe = socket.socket()
        try:
            probe.settimeout(3)
        except Exception:
            pass
        probe.connect(address)
        tcp_ok = True
    except Exception as error:
        last_error = safe_error(error)
    finally:
        if probe is not None:
            try:
                probe.close()
            except Exception:
                pass


def connect_mqtt():
    global mqtt_ok, sub_ok, pub_ok, last_error

    mqtt_ok = False
    sub_ok = False
    pub_ok = False
    wifi.mqttConnect(BROKER, client_id, "", "")
    # mqttConnect succeeds with a None return value; no exception means success.
    mqtt_ok = True
    wifi.subscribe(TOPIC_LED_COMMAND)
    sub_ok = True
    last_error = ""


def read_soil():
    global soil_raw, last_error
    try:
        value = soil_pin.getAnalog()
        soil_raw = int(value)
    except Exception as error:
        last_error = safe_error(error)
        print("SOIL_ERROR", last_error)


def process_buttons(now):
    global previous_a, previous_b, previous_m
    global last_a_at, last_b_at, last_m_at
    global button_a_count, button_b_count, page

    a_pressed = bool(buttons.btnValue("a"))
    b_pressed = bool(buttons.btnValue("b"))
    m_pressed = bool(buttons.btnValue("m"))

    if a_pressed and not previous_a and now - last_a_at >= DEBOUNCE_SECONDS:
        last_a_at = now
        button_a_count += 1
        set_led(not led_on, "A")
        publish_button("A")

    if b_pressed and not previous_b and now - last_b_at >= DEBOUNCE_SECONDS:
        last_b_at = now
        button_b_count += 1
        set_fan(not fan_on)
        publish_button("B")

    if m_pressed and not previous_m and now - last_m_at >= DEBOUNCE_SECONDS:
        last_m_at = now
        page = (page + 1) % 3

    previous_a = a_pressed
    previous_b = b_pressed
    previous_m = m_pressed


def draw_line(text, y, color=WHITE):
    screen.text(str(text), 80, y, 1, color)


def render_live():
    draw_line("綜合控制台", 8, CYAN)
    draw_line("WiFi:{} MQTT:{}".format(status_word(wifi_ok), status_word(mqtt_ok)), 23, GREEN if mqtt_ok else RED)
    draw_line("Soil P1:{}".format("--" if soil_raw is None else soil_raw), 38, WHITE)
    draw_line("LED P2:{} A:{}".format("ON" if led_on else "OFF", button_a_count), 53, GREEN if led_on else MUTED)
    draw_line("FAN M2:{} B:{}".format("ON" if fan_on else "OFF", button_b_count), 68, AMBER if fan_on else MUTED)
    draw_line("Seq:{} RX:{} TX:{}".format(seq, rx_count, tx_count), 83, WHITE)
    draw_line("LED來源:{}".format(last_led_source), 98, MUTED)
    draw_line("M:下一頁", 113, CYAN)


def render_network():
    draw_line("連線診斷", 8, CYAN)
    draw_line("WiFi:{}".format(status_word(wifi_ok)), 23, GREEN if wifi_ok else RED)
    draw_line("DNS:{}".format(status_word(dns_ok)), 38, GREEN if dns_ok else RED)
    draw_line("TCP1883:{}".format(status_word(tcp_ok)), 53, GREEN if tcp_ok else RED)
    draw_line("MQTT:{}".format(status_word(mqtt_ok)), 68, GREEN if mqtt_ok else RED)
    draw_line("SUB:{} PUB:{}".format(status_word(sub_ok), status_word(pub_ok)), 83, GREEN if sub_ok and pub_ok else AMBER)
    draw_line("重連:{} {}".format(reconnect_count, last_error), 98, RED if last_error else MUTED)
    draw_line("M:下一頁", 113, CYAN)


def render_command():
    if last_command_on is None:
        command_text = "尚未收到"
    else:
        command_text = "LED ON" if last_command_on else "LED OFF"
    age = "--"
    if last_command_at is not None:
        age = int(max(0, time.monotonic() - last_command_at))

    draw_line("網站指令", 8, CYAN)
    draw_line("最後:{}".format(command_text), 23, WHITE)
    draw_line("ID:{}".format(last_command_id[-8:] if last_command_id else "--"), 38, MUTED)
    draw_line("ACK:{}".format(last_ack), 53, GREEN if last_ack == "OK" else AMBER)
    draw_line("RX:{} TX:{}".format(rx_count, tx_count), 68, WHITE)
    draw_line("多久前:{}s".format(age), 83, MUTED)
    draw_line("錯誤:{}".format(last_error or "--"), 98, RED if last_error else MUTED)
    draw_line("M:下一頁", 113, CYAN)


def render():
    screen.fill(BLACK)
    if page == 0:
        render_live()
    elif page == 1:
        render_network()
    else:
        render_command()
    screen.refresh()


def publish_live_data():
    publish_json(TOPIC_STATUS, {"online": True, "seq": next_seq()})
    if soil_raw is None:
        read_soil()
    if soil_raw is not None:
        publish_json(TOPIC_SOIL, {"raw": soil_raw, "seq": next_seq()})


def safe_stop():
    global mqtt_ok, sub_ok, pub_ok
    mqtt_ok = False
    sub_ok = False
    pub_ok = False
    try:
        set_fan(False)
    except Exception:
        pass


set_led(False, "BOOT")
set_fan(False)
print("FutureLite Bridge", PROGRAM_VERSION, client_id)
render()

try:
    while True:
        if not wifi.isconnect():
            wifi_ok = False
            mqtt_ok = False
            sub_ok = False
            pub_ok = False
            last_error = "WiFi disconnected"
            safe_stop()
            render()
            time.sleep(RETRY_SECONDS)
            continue

        try:
            network_probe()
            connect_mqtt()
            read_soil()
            publish_live_data()

            last_publish = time.monotonic()
            last_display = 0

            while wifi.isconnect():
                now = time.monotonic()
                process_buttons(now)

                message = wifi.getMessage(TOPIC_LED_COMMAND)
                if message is not None:
                    handle_led_command(message)

                read_soil()
                if now - last_publish >= PUBLISH_INTERVAL:
                    publish_live_data()
                    last_publish = now

                if now - last_display >= DISPLAY_INTERVAL:
                    wifi_ok = bool(wifi.isconnect())
                    render()
                    last_display = now

                time.sleep(0.05)

            raise RuntimeError("WiFi disconnected")

        except KeyboardInterrupt:
            raise
        except Exception as error:
            reconnect_count += 1
            last_error = safe_error(error)
            safe_stop()
            render()
            time.sleep(RETRY_SECONDS)

except KeyboardInterrupt:
    last_error = "STOPPED"
finally:
    safe_stop()
    try:
        set_led(False, "STOP")
    except Exception:
        pass
    render()
