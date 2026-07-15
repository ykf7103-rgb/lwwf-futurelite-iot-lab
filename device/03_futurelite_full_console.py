"""
03_futurelite_full_console.py
FutureLite AI 綜合 MQTT 控制台 — 最終同步版
三頁屏幕：即時監控 / 連線診斷 / 網站指令
硬件：Soil(P1) + LED(P2) + FAN(M2) + A/M/B 按鍵
MQTT：broker.emqx.io
"""
import sys, time, json
from board import *
from future import MeowPin
from sensor import Sensor
from screen import Screen
from uwifi import WIFI

# ============================================================
# 常數
# ============================================================
PREFIX = "hksteam/demo/fla-7q4m9c2p"
TOPIC_STATUS = PREFIX + "/status"
TOPIC_SOIL = PREFIX + "/soil"
TOPIC_BUTTON = PREFIX + "/btn"
TOPIC_LED_COMMAND = PREFIX + "/led"
TOPIC_ACK = PREFIX + "/ack"
CLIENT_ID_BASE = "futurelite-fla-7q4m9c2p"
MQTT_HOST = "broker.emqx.io"
LOOP_MS = 80
PUBLISH_MS = 1000
SCREEN_MS = 350
DEBOUNCE_MS = 50
RECONNECT_WAIT_MS = 3000
WIFI_CONNECT_WAIT_MS = 12000
FAN_SPEED = 50
PROGRAM_VERSION = "USB-R6-AUTO-WIFI"

# ============================================================
# 硬體初始化
# ============================================================
soil_pin = MeowPin("P1", "ANALOG")
led_pin = MeowPin("P2", "OUT")
sensor = Sensor()
screen = Screen()
screen.autoRefresh(False)

led_pin.setDigital(False)
led_state = "OFF"
led_source = "--"

fan_state = "OFF"

btn_a_last = False
btn_b_last = False
btn_m_last = False

import random
random.seed(time.ticks_us())
tail = f"{random.getrandbits(16):04x}"
CLIENT_ID = f"{CLIENT_ID_BASE}-{tail}"

# ============================================================
# Wi-Fi 狀態
# ============================================================
def wifi_is_connected():
    try:
        import network
        return bool(network.WLAN(network.STA_IF).isconnected())
    except:
        return False

def wifi_auto_connect():
    """Use FutureOS' saved Wi-Fi profile without exposing its credentials."""
    global last_err
    if wifi_is_connected():
        return True
    try:
        import wifi as system_wifi
        print("[WiFi] starting saved-profile auto connect")
        system_wifi.try_auto_connect()
        started = time.ticks_ms()
        while time.ticks_diff(time.ticks_ms(), started) < WIFI_CONNECT_WAIT_MS:
            if wifi_is_connected():
                print("[WiFi] connected")
                last_err = ""
                return True
            time.sleep_ms(250)
    except Exception as e:
        last_err = "WiFi " + type(e).__name__
        print("[WiFi] auto connect FAIL", type(e).__name__, repr(e))
    return wifi_is_connected()

# ============================================================
# 統計
# ============================================================
seq = 0
btn_a_cnt = 0
btn_b_cnt = 0
reconn_cnt = 0
tx_cnt = 0
rx_cnt = 0
last_err = ""
last_cmd_id = ""
last_cmd_on = None
last_ack = "--"
last_cmd_src = "--"
last_cmd_tick = 0

diag = {"wifi":False,"dns":False,"tcp":False,"mqtt":False,"sub":False,"pub":False}

def run_diag():
    d = {"wifi":wifi_is_connected(),"dns":False,"tcp":False,"mqtt":False,"sub":False,"pub":False}
    try:
        import socket
        ai = socket.getaddrinfo(MQTT_HOST, 1883)
        d["dns"] = True
        s = socket.socket()
        s.settimeout(5)
        s.connect(ai[0][4])
        d["tcp"] = True
        s.close()
    except:
        pass
    diag.update(d)

# ============================================================
# MQTT
# ============================================================
wifi_mqtt = WIFI()
mqtt_ok = False
last_pub_tick = 0
last_reconn_tick = 0
publish_phase = 0

def mqtt_connect():
    global mqtt_ok, diag
    try:
        r = wifi_mqtt.mqttConnect(MQTT_HOST, CLIENT_ID, "", "")
        print(f"[MQTT] mqttConnect ret type={type(r).__name__} repr={repr(r)}")
        wifi_mqtt.subscribe(TOPIC_LED_COMMAND)
        print("[MQTT] subscribe OK")
        wifi_mqtt.publish(TOPIC_STATUS, json.dumps({"online":True,"seq":0,"ver":PROGRAM_VERSION}))
        print("[MQTT] publish test OK")
        mqtt_ok = True
        diag["mqtt"] = True; diag["sub"] = True; diag["pub"] = True
        # topic 長度檢查
        for topic in (TOPIC_STATUS, TOPIC_SOIL, TOPIC_BUTTON, TOPIC_LED_COMMAND, TOPIC_ACK):
            print("TOPIC", len(topic), topic)
            if len(topic) > 32:
                raise ValueError("topic too long: " + topic)
        return True
    except Exception as e:
        print(f"[MQTT] connect FAIL: {type(e).__name__} {repr(e)}")
        mqtt_ok = False
        diag["mqtt"] = False; diag["sub"] = False; diag["pub"] = False
        return False

def pub(topic, payload):
    global tx_cnt
    if not mqtt_ok:
        return
    try:
        j = json.dumps(payload)
        wifi_mqtt.publish(topic, j)
        tx_cnt += 1
        return True
    except Exception as e:
        print(f"[PUB ERR] {topic} {type(e).__name__} {repr(e)}")
        return False

def poll_mqtt():
    global mqtt_ok, led_state, led_source, rx_cnt, last_cmd_id, last_cmd_on, last_ack, last_cmd_tick, last_cmd_src
    if not mqtt_ok:
        return
    try:
        # FutureLite uwifi requires the subscribed topic as the argument.
        msg = wifi_mqtt.getMessage(TOPIC_LED_COMMAND)
        if msg is None:
            return
        raw = msg.decode("utf-8") if isinstance(msg, bytes) else str(msg)
        data = json.loads(raw)
        cid = data.get("id")
        con = data.get("on")
        if cid is None or con is None:
            return
        rx_cnt += 1
        last_cmd_id = cid
        last_cmd_tick = time.ticks_ms()
        last_cmd_src = "WEB"
        print(f"[RX] led id={cid} on={con}")
        if con is True:
            led_pin.setDigital(True)
            led_state = "ON"
            led_source = "WEB"
            last_cmd_on = True
            ack_ok = pub(TOPIC_ACK, {"id":cid,"ok":True,"on":True})
            last_ack = "OK" if ack_ok else "ERR"
            print(f"[ACK] {'OK' if ack_ok else 'FAIL'} id={cid} on=True")
        elif con is False:
            led_pin.setDigital(False)
            led_state = "OFF"
            led_source = "WEB"
            last_cmd_on = False
            ack_ok = pub(TOPIC_ACK, {"id":cid,"ok":True,"on":False})
            last_ack = "OK" if ack_ok else "ERR"
            print(f"[ACK] {'OK' if ack_ok else 'FAIL'} id={cid} on=False")
        else:
            ack_ok = pub(TOPIC_ACK, {"id":cid,"ok":False})
            last_ack = "ERR"
    except Exception as e:
        print(f"[POLL ERR] {type(e).__name__} {repr(e)}")

# ============================================================
# 螢幕
# ============================================================
_page = 1
_last_screen = 0

def center(text, size=1, w=160, h=128):
    cw, ew, nw, sw = 12, 7, 7, 6
    tw = sum(cw if '\u4e00'<=c<='\u9fff' else (nw if c.isdigit() else (sw if c==' ' else ew)) for c in text)
    return ((w-tw*size)//2, (h-12*size)//2)

def draw_p1():
    screen.fill((0,0,0))
    x,_=center("USB R5 MONITOR",2)
    screen.text("USB R5 MONITOR",x,2,2,(0,255,255))
    wok = wifi_is_connected()
    screen.text(f"WiFi:{'YES' if wok else 'NO'}  MQTT:{'YES' if mqtt_ok else 'NO'}",5,25,1,(200,200,200))
    screen.text(f"Soil P1:{soil_pin.getAnalog()}",5,42,1,(0,255,0))
    screen.text(f"LED P2:{led_state}",5,56,1,(255,255,0))
    screen.text(f"FAN M2:{fan_state}",5,70,1,(255,180,0))
    screen.text(f"A:{btn_a_cnt} B:{btn_b_cnt}",5,84,1,(180,180,255))
    screen.text(f"Seq:{seq}",5,98,1,(180,180,180))
    screen.text(f"RX:{rx_cnt} TX:{tx_cnt}",5,110,1,(150,150,150))
    screen.text("M:next",60,120,1,(80,80,80))
    screen.refresh()

def draw_p2():
    screen.fill((0,0,0))
    x,_=center("NETWORK TEST",2)
    screen.text("NETWORK TEST",x,2,2,(0,255,255))
    y=25
    for k in ["wifi","dns","tcp","mqtt","sub","pub"]:
        v = diag.get(k,False)
        screen.text(f"{k.upper()}:{'YES' if v else 'NO'}",5,y,1,(200,200,200))
        y+=14
    screen.text(f"Reconn:{reconn_cnt}",5,y,1,(180,180,180)); y+=14
    e = last_err[:22] if last_err else "--"
    screen.text(f"ERR:{e}",5,y,1,(255,100,100))
    screen.text("M:next",60,118,1,(80,80,80))
    screen.refresh()

def draw_p3():
    screen.fill((0,0,0))
    x,_=center("WEB COMMAND",2)
    screen.text("WEB COMMAND",x,2,2,(0,255,255))
    cs = "--" if last_cmd_on is None else ("ON" if last_cmd_on else "OFF")
    screen.text(f"LastCmd:LED {cs}",5,25,1,(200,200,200))
    sid = last_cmd_id[-8:] if len(last_cmd_id)>8 else (last_cmd_id if last_cmd_id else "--")
    screen.text(f"ID:{sid}",5,39,1,(180,180,255))
    ac = (0,255,0) if last_ack=="OK" else ((255,100,100) if last_ack=="ERR" else (150,150,150))
    screen.text(f"ACK:{last_ack}",5,53,1,ac)
    screen.text(f"From:{last_cmd_src}",5,67,1,(200,200,200))
    screen.text(f"RX:{rx_cnt} TX:{tx_cnt}",5,81,1,(180,180,180))
    if last_cmd_tick>0:
        sc = time.ticks_diff(time.ticks_ms(),last_cmd_tick)//1000
        screen.text(f"Ago:{sc}s",5,95,1,(150,150,150))
    screen.text("M:next",60,118,1,(80,80,80))
    screen.refresh()

def refresh():
    global _last_screen
    now = time.ticks_ms()
    if time.ticks_diff(now,_last_screen) < SCREEN_MS:
        return
    _last_screen = now
    if _page==1: draw_p1()
    elif _page==2: draw_p2()
    else: draw_p3()

# ============================================================
# 主程式
# ============================================================
try:
    print("[System] FutureLite 綜合控制台啟動", PROGRAM_VERSION)
    led_pin.setDigital(False)
    try:
        from future import Motor
        Motor().stopMotor(2)
    except:
        pass
    screen.fill((0,0,0))
    screen.text("檢查網絡中...",*center("檢查網絡中...",2),2,(0,255,255))
    screen.refresh()
    wifi_auto_connect()
    run_diag()
    print(f"[Diag] WiFi:{'OK' if diag['wifi'] else 'NO'} DNS:{'OK' if diag['dns'] else 'NO'} TCP:{'OK' if diag['tcp'] else 'NO'}")
    if diag["wifi"] and diag["dns"] and diag["tcp"]:
        mqtt_connect()
    print(f"[MQTT] {'OK' if mqtt_ok else 'FAIL'}")
    refresh()

    while True:
        now = time.ticks_ms()

        # --- Wi-Fi 自動重連（使用 FutureOS 已儲存設定）---
        if not wifi_is_connected():
            if last_reconn_tick==0 or time.ticks_diff(now,last_reconn_tick)>=RECONNECT_WAIT_MS:
                last_reconn_tick=now
                reconn_cnt+=1
                mqtt_ok=False
                diag["mqtt"]=False; diag["sub"]=False; diag["pub"]=False
                wifi_auto_connect()

        # --- MQTT 重連 ---
        if wifi_is_connected() and not mqtt_ok:
            if last_reconn_tick==0 or time.ticks_diff(now,last_reconn_tick)>=RECONNECT_WAIT_MS:
                last_reconn_tick=now
                reconn_cnt+=1
                print(f"[Reconn] #{reconn_cnt}")
                if fan_state=="ON":
                    try:
                        from future import Motor
                        Motor().stopMotor(2)
                        fan_state="OFF"
                    except: pass
                run_diag()
                if diag["dns"] and diag["tcp"]:
                    mqtt_connect()

        # --- 輪詢 MQTT ---
        poll_mqtt()

        # --- 讀取 Soil ---
        soil_val = soil_pin.getAnalog()

        # --- 按鍵 ---
        ca = sensor.btnValue('a')
        cb = sensor.btnValue('b')
        cm = sensor.btnValue('m')

        if ca and not btn_a_last:
            time.sleep_ms(DEBOUNCE_MS)
            if sensor.btnValue('a'):
                btn_a_cnt+=1
                if led_state=="ON":
                    led_pin.setDigital(False); led_state="OFF"
                else:
                    led_pin.setDigital(True); led_state="ON"
                led_source="A本機"
                seq+=1
                pub(TOPIC_BUTTON,{"button":"A","seq":seq})
                print(f"TEL|{seq}|A|LED|{led_state}")

        if cb and not btn_b_last:
            time.sleep_ms(DEBOUNCE_MS)
            if sensor.btnValue('b'):
                btn_b_cnt+=1
                if fan_state=="ON":
                    try:
                        from future import Motor
                        Motor().stopMotor(2)
                    except: pass
                    fan_state="OFF"
                else:
                    try:
                        from future import Motor
                        Motor().setSpeed(2,FAN_SPEED,0)
                    except: pass
                    fan_state="ON"
                seq+=1
                pub(TOPIC_BUTTON,{"button":"B","seq":seq})
                print(f"TEL|{seq}|B|FAN|{fan_state}")

        if cm and not btn_m_last:
            time.sleep_ms(DEBOUNCE_MS)
            if sensor.btnValue('m'):
                _page = (_page%3)+1
                if _page==1: draw_p1()
                elif _page==2: draw_p2()
                else: draw_p3()
                _last_screen=time.ticks_ms()

        btn_a_last, btn_b_last, btn_m_last = ca, cb, cm

        # --- 每秒只 publish 一條；status / soil 輪流，各約兩秒一次 ---
        if mqtt_ok:
            if last_pub_tick==0 or time.ticks_diff(now,last_pub_tick)>=PUBLISH_MS:
                last_pub_tick=now
                seq+=1
                if publish_phase == 0:
                    sent = pub(TOPIC_STATUS, {"online":True,"seq":seq,"ver":PROGRAM_VERSION})
                    if sent: print(f"[PUB] status seq={seq} OK")
                    publish_phase = 1
                else:
                    sent = pub(TOPIC_SOIL, {"raw":soil_val,"seq":seq})
                    if sent: print(f"[PUB] soil raw={soil_val} seq={seq} OK")
                    publish_phase = 0

        # --- 螢幕 ---
        refresh()
        time.sleep_ms(LOOP_MS)

except KeyboardInterrupt:
    print("[System] 收到停止訊號")
except Exception as e:
    last_err = f"{type(e).__name__}"
    print("ERROR:")
    sys.print_exception(e)
finally:
    led_pin.setDigital(False)
    try:
        from future import Motor
        Motor().stopMotor(2)
    except: pass
    screen.fill((0,0,0))
    screen.text("STOPPED",*center("STOPPED",2),2,(255,0,0))
    screen.refresh()
    print("[System] LED OFF, FAN OFF, STOPPED")
