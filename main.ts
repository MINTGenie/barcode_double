function move_to_read (speed: number, move_duration: number, calib_or_not: boolean) {
    maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CW, speed)
    white_space = input.runningTime()
    p14_white = input.runningTime()
    basic.pause(move_duration)
    maqueen.motorStop(maqueen.Motors.All)
    serial.writeLine("-------------------------------------------------------------")
    serial.writeValue("P13 list len", list.length)
    serial.writeLine("-------------------------------------------------------------")
    measure(calib_or_not, Calib_len)
}
input.onButtonPressed(Button.A, function () {
    list = []
    p14list = []
    move_to_read(motor_speed, 2000, false)
    basic.pause(1000)
})
pins.onPulsed(DigitalPin.P13, PulseValue.Low, function () {
    list.push(input.runningTimeMicros())
    list.push(pins.pulseDuration())
})
pins.onPulsed(DigitalPin.P14, PulseValue.Low, function () {
    p14list.push(input.runningTimeMicros())
    p14list.push(pins.pulseDuration())
})
function measure (calibrate: boolean, cal_length: number) {
    basic.pause(500)
    for (let value of list) {
        idx = list.indexOf(value)
        if (idx == 0) {
            white_space = value - white_space
            serial.writeValue("whitespace duration (uS)", white_space)
        } else if (idx % 2 == 0) {
            white_space = value - list[idx - 2]
            serial.writeValue("whitespace duration (uS)", white_space)
        } else {
            serial.writeValue("bar duration (uS)", value)
            if (calibrate) {
                serial.writeValue("************* Calib bar length", value * cal_length / list[1])
                Calib_duration = list[1]
                if (Math.abs(cal_length - value * 1.6 / list[1]) > 0.5) {
                    serial.writeLine("Calib fail - resetting...")
                    basic.pause(500)
                    control.reset()
                }
            } else {
                serial.writeValue("move duration", Calib_duration)
                serial.writeValue("************* bar length", value * cal_length / Calib_duration)
            }
        }
    }
    serial.writeValue("p14 list len", p14list.length)
    for (let value of p14list) {
        idx = p14list.indexOf(value)
        if (idx == 0) {
            p14_white = value - p14_white
            serial.writeValue("p14 whitespace duration", p14_white)
        } else if (idx % 2 == 0) {
            p14_white = value - p14list[idx - 2]
            serial.writeValue("p14 whitespace duration", p14_white)
        } else {
            serial.writeValue("p14 bar duration", value)
            if (calibrate) {
                serial.writeValue("************* p14 Calib bar length", value * cal_length / p14list[1])
                p14_calib_duration = list[1]
            } else {
                serial.writeValue("p14 move duration", p14_calib_duration)
                serial.writeValue("************* P14 bar length", value * cal_length / p14_calib_duration)
            }
        }
    }
}
let p14_calib_duration = 0
let Calib_duration = 0
let p14list: number[] = []
let p14_white = 0
let white_space = 0
let Calib_len = 0
let motor_speed = 0
let idx = 0
let list: number[] = []
serial.writeValue("s", control.millis())
list = []
idx = 0
let calib_move_duration = 1000
let start = false
motor_speed = 30
serial.writeLine("Enter Calib bar length:")
let tmp_read = serial.readLine()
Calib_len = parseFloat(tmp_read)
start = true
move_to_read(motor_speed, calib_move_duration, true)
