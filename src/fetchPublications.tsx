import * as data from "./publications.json"

const dataArray = (data as any).default

const fetchPaperInfo = (): PaperInfo[] => {
  const paperInfoArray: PaperInfo[] = dataArray
  return paperInfoArray.filter((paper) => paper.title !== "example")
}

export default fetchPaperInfo
