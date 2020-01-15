import {ipcMain,BrowserWindow}from 'electron'
import {
    OPCUAClient,
    ClientSession,
    Variant
  } from "node-opcua";

  import{hwIdConfig} from './readExcel'
  import{sleep} from './sleep'

export const runTest = async( win : BrowserWindow ,opcUaEndPoint : string, drives:hwIdConfig[])=>{
  console.log(opcUaEndPoint)
  const options = {
    applicationName: "SewDriveTester",
    endpoint_must_exist: false
  };
  let opcClient = OPCUAClient.create(options)
  await opcClient.connect(opcUaEndPoint).catch(e => {
    console.log(e)
    win.webContents.send('Error',e)

  })
    console.log('connected')
  let session: ClientSession | void  = await opcClient.createSession().catch(e =>{
    console.log(e)
    win.webContents.send('Error',e)
  })
  const varModeDev = 'ns=3;s="dev"."modeDev"';
  const varEnable = 'ns=3;s="dev"."enable"'
  const varSpeed = 'ns=3;s="dev"."speed"'
const varHwid = 'ns=3;s="dev"."hwid"'
  const plcTrue : Variant = new Variant( {
    dataType: "Boolean",
    value: true
  });
  const plcTFalse : Variant = new Variant( {
    dataType: "Boolean",
    value: true
  });
  //console.log(session)
  if (session){
    await session.writeSingleNode(varModeDev,plcTrue)
    await sleep(100)
    for(let drive of drives){
      
      drive.color = "#BBDEFB"
      win.webContents.send('UpdateDrive',drive)
      
      let plcHwId : Variant = new Variant({
        dataType : "UInt16",
        value: drive.hwId
      })
      await session.writeSingleNode(varHwid,plcHwId)
    await sleep(5000)

    drive.color = "#80CBC4"
      win.webContents.send('UpdateDrive',drive)

    }


    session.close
    opcClient.disconnect()
  }
else{
  opcClient.disconnect()
  win.webContents.send('Error','Could not create session')
  
}
 
}

const beforeAll = async (session : ClientSession) =>{


}