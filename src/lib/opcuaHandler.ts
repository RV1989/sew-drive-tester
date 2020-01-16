import { ipcMain, BrowserWindow } from 'electron'
import {
  OPCUAClient,
  ClientSession,
  Variant
} from "node-opcua";

import { hwIdConfig } from './readExcel'
import { sleep } from './sleep'

export const runTest = async (win: BrowserWindow, opcUaEndPoint: string, drives: hwIdConfig[]) => {
  console.log(opcUaEndPoint)
  const options = {
    applicationName: "SewDriveTester",
    endpoint_must_exist: false
  };
  let opcClient = OPCUAClient.create(options)
  await opcClient.connect(opcUaEndPoint).catch(e => {
    console.log(e)
    win.webContents.send('Error', e)

  })
  console.log('connected')
  let session: ClientSession | void = await opcClient.createSession().catch(e => {
    console.log(e)
    win.webContents.send('Error', e)
  })
  // write var
  const varModeDev = 'ns=3;s="dev"."modeDev"';
  const varEnable = 'ns=3;s="dev"."enable"'
  const varSpeed = 'ns=3;s="dev"."speed"'
  const varForward = 'ns=3;s="dev"."forward"'
  const varHwid = 'ns=3;s="dev"."hwid"'
  // read var
  const varActualSpeed = 'ns=3;s="dev"."actualSpeed"';
  const varDriveEnabled = 'ns=3;s="dev"."driveEnabled"';
  const varDriveReady = 'ns=3;s="dev"."driveReady"';

  const plcTrue: Variant = new Variant({
    dataType: "Boolean",
    value: true
  });
  const plcFalse: Variant = new Variant({
    dataType: "Boolean",
    value: true
  });
  //console.log(session)
  if (session) {
    await session.writeSingleNode(varModeDev, plcTrue)
    await sleep(100)
    for (let drive of drives) {
      let testPassing = true
      drive.color = "#BBDEFB"
      win.webContents.send('UpdateDrive', drive)
      let plcHwId: Variant = new Variant({
        dataType: "UInt16",
        value: drive.hwId
      })
      let plcSpeedMax: Variant = new Variant({
        dataType: "Int16",
        value: 2500
      })

      let plcSpeed0: Variant = new Variant({
        dataType: "Int16",
        value: 0
      })
      // before all
      await session.writeSingleNode(varForward, plcFalse)
      await session.writeSingleNode(varDriveEnabled, plcFalse)
      await session.writeSingleNode(varSpeed, plcSpeed0)
      await session.writeSingleNode(varHwid, plcHwId)

      // test disabled
      if (testPassing) {
        // write enable to True should result in driveEnabeled false
        await session.writeSingleNode(varDriveEnabled, plcTrue)
        await sleep(100)
        let enable = await session.readVariableValue(varDriveEnabled)
        if (enable.value.value) {
          testPassing = false
        }
      }
      // test enable
      if (testPassing) {
        // write enable to False should result in driveEnabled true
        await session.writeSingleNode(varDriveEnabled, plcFalse)
        await sleep(100)
        let enable = await session.readVariableValue(varDriveEnabled)
        if (!enable.value.value) {
          testPassing = false
        }
      }

      // test speed
      if (testPassing) {
        // write speed and forward drive should return speed after delay
        await session.writeSingleNode(varSpeed, plcSpeedMax)
        await session.writeSingleNode(varForward, plcTrue)
        await sleep(2000)
        let actualSpeed = await session.readVariableValue(varActualSpeed)
        if (actualSpeed.value.value < 2500 - 100) {
          testPassing = false
        }
      }

      // test speed
      if (testPassing) {
        // write speed and forward drive should return speed after delay
        await session.writeSingleNode(varSpeed, plcSpeedMax)
        await session.writeSingleNode(varForward, plcFalse)
        await sleep(2000)
        let actualSpeed = await session.readVariableValue(varActualSpeed)
        if (actualSpeed.value.value > 0 + 100) {
          testPassing = false
        }
      }


      // end return status
      if (testPassing) {
        drive.color = "#80CBC4"
        win.webContents.send('UpdateDrive', drive)
      }
      else {
        drive.color = "#F48FB1"
        win.webContents.send('UpdateDrive', drive)
      }


    }


    session.close
    opcClient.disconnect()
  }
  else {
    opcClient.disconnect()
    win.webContents.send('Error', 'Could not create session')

  }

}

const beforeAll = async (session: ClientSession) => {


}