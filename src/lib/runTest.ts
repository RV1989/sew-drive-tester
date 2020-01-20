import { BrowserWindow } from 'electron'


import { Client, HttpsClientOptions } from 'jayson/promise'

import { hwIdConfig } from './readExcel'
import { sleep } from './sleep'

export const runTest = async (win: BrowserWindow | null, ipAdress: string, drives: hwIdConfig[], speed: number, ramp: number): Promise<string> => {
  if (!win) {
    return new Promise<string>((resolve, reject) => {
      reject('noWindow');
    })
  }

  const connectionOptions: HttpsClientOptions = {}
  connectionOptions.host = ipAdress
  connectionOptions.method = 'POST'
  connectionOptions.path = '/api/jsonrpc'
  connectionOptions.rejectUnauthorized = false

  const _clientLogin: Client = Client.https(connectionOptions)
  const loginInfo = {
    "user": "RVB",
    "password": "RVB"
  }

  let response = await _clientLogin.request('Api.Login', loginInfo).catch(e => {
    console.log(e)
    win.webContents.send('Error', e)
  })

  if (!response.result.token) {
    return new Promise<string>((resolve, reject) => {
      win.webContents.send('Error', 'could not login')
      reject('could not log in');
    })
  }
  connectionOptions.headers = { 'X-Auth-Token': `${response.result.token}` }

  const _client: Client = Client.https(connectionOptions)

  const options = {
    applicationName: "SewDriveTester",
    endpoint_must_exist: false
  };

  // write var
  const varModeDev = '"dev"."modeDev"';
  const varEnable = '"dev"."enable"'
  const varSpeed = '"dev"."speed"'
  const varForward = '"dev"."forward"'
  const varHwid = '"dev"."hwID"'
  // read var
  const varActualSpeed = '"dev"."actualSpeed"';
  const varDriveEnabled = '"dev"."driveEnabled"';
  const varDriveReady = '"dev"."driveReady"';


  //console.log(session)

  for (let drive of drives) {
    let testPassing = true
    drive.color = "#BBDEFB"
    drive.status = 'Started....'
    win.webContents.send('UpdateDrive', drive)

    // before all
    await _client.request('PlcProgram.Write', { var: varForward, value: false })
    await _client.request('PlcProgram.Write', { var: varEnable, value: false })
    await _client.request('PlcProgram.Write', { var: varSpeed, value: 0 })
    await _client.request('PlcProgram.Write', { var: varHwid, value: drive.hwId })


    // test disabled
    if (testPassing) {
      // write enable to True should result in driveEnabeled false
      await _client.request('PlcProgram.Write', { var: varEnable, value: true })

      //await sleep(100)
      let enable = await _client.request('PlcProgram.Read', { var: varDriveEnabled })


      if (enable.result === true) {
        testPassing = false
        drive.status = 'Failed: Can not disable drive'
      }
    }
    // test enable
    if (testPassing) {
      // write enable to False should result in driveEnabled true
      await _client.request('PlcProgram.Write', { var: varEnable, value: false })

      //await sleep(100)
      let enable = await _client.request('PlcProgram.Read', { var: varDriveEnabled })
      if (enable.result === false) {
        testPassing = false
        drive.status = 'Failed: Can not enable drive'
      }
    }

    // test speed
    if (testPassing) {
      // write speed and forward drive should return speed after delay
      await _client.request('PlcProgram.Write', { var: varSpeed, value: speed })
      await _client.request('PlcProgram.Write', { var: varForward, value: true })
      await sleep(ramp + 100)
      let actualSpeed = await _client.request('PlcProgram.Read', { var: varActualSpeed })


      if (actualSpeed.result < speed - 100) {
        testPassing = false
        drive.status = `Failed: drive dit not reach ${speed} in ${ramp} ms`
      }
    }

    // test speed
    if (testPassing) {
      // write speed and forward drive should return speed after delay
      await _client.request('PlcProgram.Write', { var: varSpeed, value: speed })
      await _client.request('PlcProgram.Write', { var: varForward, value: false })

      await sleep(ramp + 100)
      let actualSpeed = await _client.request('PlcProgram.Read', { var: varActualSpeed })
      if (actualSpeed.result > 0 + 100) {
        testPassing = false
        drive.status = `Failed: drive dit not reach 0 in ${ramp} ms`
      }
    }


    // end return status
    if (testPassing) {
      drive.color = "#80CBC4"
      drive.status = 'PASSED'
      win.webContents.send('UpdateDrive', drive)
    }
    else {
      drive.color = "#F48FB1"
      win.webContents.send('UpdateDrive', drive)
    }


  }


  await _client.request('PlcProgram.Write', { var: varForward, value: false })
  await _client.request('PlcProgram.Write', { varDriveEnabled, value: false })
  await _client.request('PlcProgram.Write', { varModeDev, value: false })

  return new Promise<string>((resolve, reject) => {
    resolve('done');
  })


}




