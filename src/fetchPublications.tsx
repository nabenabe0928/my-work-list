import * as data from "./publications.json"

const dataArray = (data as any).default

const fetchPaperInfo = (): PaperInfo[] => {
  const paperInfoArray: PaperInfo[] = dataArray
  const paperInfo = paperInfoArray.filter((paper) => paper.title !== "example")
  console.log(paperInfo[0].title)
  return paperInfo
}

export default fetchPaperInfo
