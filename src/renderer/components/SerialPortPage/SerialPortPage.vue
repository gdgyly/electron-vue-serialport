<template>
  <div id="serial-main">
    <div id="serial-left">
      <el-form :model="serialInfo" label-position="top">
        <el-form-item label="选择串口">
          <el-select v-model="serialInfo.name" placeholder="请选择串口名">
            <el-option v-for="item in serialList" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="波特率">
          <el-select v-model="serialInfo.baudRate" placeholder="请选择波特率">
            <el-option
              v-for="item in baudRateList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="校验">
          <el-select v-model="serialInfo.parity" placeholder="请选择校验">
            <el-option
              v-for="item in parityList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="停止位">
          <el-select v-model="serialInfo.stopBit" placeholder="请选择停止位">
            <el-option
              v-for="item in stopBitList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据位">
          <el-select v-model="serialInfo.dataBit" placeholder="请选择数据位">
            <el-option
              v-for="item in dataBitList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="openSerial">打开串口</el-button>
          <el-button type="danger" @click="closeSerial">关闭串口</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div id="serial-middle">
      <div id="serial-rece">
        <i>接收数据：</i>
        <el-input type="textarea" :rows="15" v-model="serialReceData"></el-input>
      </div>
      <div id="serial-send">
        <i>发送数据：</i>
        <el-input type="textarea" :rows="2" v-model="serialSendData"></el-input>
        <div style="margin-top:10px">
          <el-button @click="serialSend" type="primary">发送</el-button>
        </div>
      </div>
    </div>
    <div id="serial-right">
      <el-button @click="clear">清空</el-button>
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = require('electron')

export default {
  data () {
    return {
      serialInfo: {
        name: '',
        baudRate: 9600,
        parity: 'none',
        stopBit: 1,
        dataBit: 8
      },
      serialList: [],
      baudRateList: [
        {
          label: '1200',
          value: 1200
        },
        {
          label: '9600',
          value: 9600
        },
        {
          label: '38400',
          value: 38400
        },
        {
          label: '115200',
          value: 115200
        }
      ],
      parityList: [
        {
          label: 'None',
          value: 'none'
        },
        {
          label: 'Odd',
          value: 'odd'
        },
        {
          label: 'Even',
          value: 'even'
        }
      ],
      stopBitList: [
        {
          label: '1',
          value: 1
        },
        {
          label: '1.5',
          value: 1.5
        },
        {
          label: '2',
          value: 2
        }
      ],
      dataBitList: [
        {
          label: '5',
          value: 5
        },
        {
          label: '6',
          value: 6
        },
        {
          label: '7',
          value: 7
        },
        {
          label: '8',
          value: 8
        }
      ],
      serialReceData: '',
      serialSendData: ''
    }
  },
  created () {
    this.findSerial()
  },
  mounted () {},
  methods: {
    findSerial () {
      ipcRenderer.on('findserialport-reply', (event, arg) => {
        console.log(arg)
        arg.forEach(item => {
          this.serialList.push(item.path)
        })
        // serialList.push(arg.)
      })
      ipcRenderer.send('find-serialport', 'find')
    },
    openSerial () {
      ipcRenderer.send('open-serialport', this.serialInfo)
      ipcRenderer.on('rece-serialport', (event, arg) => {
        this.serialReceData = this.serialReceData + arg
      })
    },
    closeSerial () {
      console.log('关串口！')
      ipcRenderer.send('close-serialport', this.serialInfo)
    },
    serialSend () {
      ipcRenderer.send('send-serialport', this.serialSendData)
    },
    clear () {
      this.serialReceData = ''
    }
  }
}
</script>

<style>
#serial-main {
  display: flex;
  flex-direction: row;
}

#serial-left {
  display: flex;
  flex-direction: column;
  margin: 10px;
}

#serial-middle {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin: 10px;
}

#serial-right {
  display: flex;
  flex-direction: column;
  margin: 10px;
}

#serial-rece {
  display: flex;
  flex-direction: column;
}

#serial-send {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}
</style>