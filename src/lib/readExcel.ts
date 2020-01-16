import {readFile, utils ,WorkBook ,WorkSheet , Range,Sheet2JSONOpts} from 'xlsx'


export interface ufrConfig {
    ipAddress : string
    pnName : string
    gsd : string
    ufr : string
    slot: string
    startAddress : string
    drivesId? : hwIdConfig[] | undefined
}
export interface hwIdConfig {
    hwIdName : string
    type : string
    hwId : string
    color: string
    status: string
}
 
const getMaxRows = (_workbook: WorkBook , _sheet:any) =>{
    let rangeString : string | undefined= _workbook.Sheets[_sheet]['!ref']
    if (rangeString){
        let range: Range = utils.decode_range(rangeString) 
        return range.e.r +1
    }
    else{
        return Error('range not found')
    }
 
  }

const readWorkBook = async (path : string): Promise<WorkBook> => {
    return new Promise((resolve, reject) => {
      try {
        let workbookPath = path
        if (workbookPath.match(/(.xlsx+)|(.xlsm)|(.xls)/g)) {
          let workbook  = readFile(workbookPath)
          if (workbook) {
            return resolve(workbook)
          } 
          else {
            reject(Error('An error has occured while reading the workbook'))
          }
        }
        else{
            return reject(Error('file extention does not match .xlsx .xlsm . xls'))
        } 
       
      } catch (err) {
        return reject(err.message )
      }
    })
  }
  const readUfrConfig = async (workbookPath :string): Promise<ufrConfig[]> => {
    let sheet = 'Drives'
    let workbook = await readWorkBook(workbookPath)
    let maxRow = getMaxRows(workbook, sheet)
    let readOptions :Sheet2JSONOpts = {}
    readOptions.range = 'A2-ZZ' + maxRow
    readOptions.header = [
      'ipAddress',
      'pnName',
      'gsd',
      'ufr',
      'slot',
      'startAddress',
    ]
    return (utils.sheet_to_json(workbook.Sheets[sheet], readOptions))
  }

  const readUfrHwId = async (workbookPath : string): Promise<hwIdConfig[]> => {
    let sheet = 'HwId'
    let _workbook = await readWorkBook(workbookPath)
    let maxRow = getMaxRows(_workbook, sheet)
    let readOptions: Sheet2JSONOpts  = {} 
    readOptions.range = 'A2-ZZ' + maxRow
    readOptions.header = [
      'hwIdName',
      'type',
      'hwId'
        ]
    return (utils.sheet_to_json(_workbook.Sheets[sheet], readOptions))
  }

  const getDrives = (hwIdConfig : hwIdConfig[] , ufrConfig : ufrConfig[] , ufr : ufrConfig) : hwIdConfig[] => {
    let drives = ufrConfig.filter( drive => drive.ufr == ufr.pnName )
    let returnDrives : hwIdConfig[] = []
    for ( let drive of drives){
        let hwId  = hwIdConfig.find(x =>x.hwIdName.includes(ufr.pnName) && x.hwIdName.includes(drive.pnName)  )
        if( hwId){
            hwId.color = "#FFFFFF"
            hwId.status = 'not started'
            returnDrives.push(hwId)
        }
        

    }

  return returnDrives

}

  export const getUfrs = async (workbookPath:string) => {
    let ufrConfig : ufrConfig[] = await readUfrConfig(workbookPath)
    let hwIDConfig : hwIdConfig[] =  await  readUfrHwId (workbookPath)
    let ufr = ufrConfig.filter( row => row.gsd.includes('/DAP/'))
       
    //console.log(ufr)
    
    for (let u of ufr){
        let drive = await getDrives(hwIDConfig, ufrConfig, u )
        //console.log(drive)
        if (drive){
            u.drivesId = drive
        }
        
        //console.log(u)

    }

    return(ufr)

;
}