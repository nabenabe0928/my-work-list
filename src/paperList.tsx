import { IconButton, ListItemIcon, Menu, MenuItem, TableSortLabel } from "@mui/material"
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank"
import FilterListIcon from "@mui/icons-material/FilterList"
import CheckBoxIcon from "@mui/icons-material/CheckBox"
import React from "react"
import fetchPaperInfo from "./fetchPublications"

const PaperListPage = () => {
  const getFilterChoices = () => {
    const venueTypes = fetchPaperInfo().map((paper) => paper.venueType)
    const filterChoices = venueTypes
      .filter((venueType, i) => venueTypes.indexOf(venueType) === i)
      .sort()
    return ["First Author Papers", ...filterChoices]
  }
  const myName = "Shuhei Watanabe"
  const filterChoices = getFilterChoices()
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = React.useState<null | HTMLElement>(null)
  const [yearOrderByDescending, setYearOrderByDescending] = React.useState(true)
  const [tickedMenus, setTickedMenus] = React.useState([
    false,
    ...Array(filterChoices.length - 1).fill(true),
  ])

  const originalPaperInfo = fetchPaperInfo().sort((paper1, paper2) => {
    const i1 = filterChoices.indexOf(paper1.venueType)
    const i2 = filterChoices.indexOf(paper2.venueType)
    if (i1 !== i2) {
      return i1 - i2
    }

    const yearOrder = paper2.publishedYear !== paper1.publishedYear
      ? paper2.publishedYear - paper1.publishedYear
      : paper2.publishedMonth - paper1.publishedMonth
    return yearOrderByDescending ? yearOrder : -yearOrder
  })

  const paperInfo = originalPaperInfo
    .filter((paper) => tickedMenus[filterChoices.indexOf(paper.venueType)])
    .filter((paper) => (tickedMenus[0] ? paper.firstAuthors.includes(myName) : true))

  const getSourceInfo = (urls: MaterialURLs) => {
    const sourceInfo = []
    const getSourceContent = (urls: string[], srcNames: string[]) => {
      const elements = urls.map((url, i) => (
        <a href={url} target="_blank">
          {srcNames[i]}
        </a>
      ))
      return <>({elements.map((e, i) => (i !== elements.length - 1 ? <>{e}/</> : e))})</>
    }
    if (urls.arxiv) {
      sourceInfo.push(getSourceContent([urls.arxiv], ["arXiv"]))
    }
    if (urls.pdf) {
      sourceInfo.push(getSourceContent([urls.pdf], [!urls.arxiv ? "PDF" : "Outdated PDF"]))
    }
    if (urls.code) {
      sourceInfo.push(getSourceContent([urls.code], ["code"]))
    }
    if (urls.poster) {
      sourceInfo.push(getSourceContent([urls.poster], ["poster"]))
    }
    if (urls.slide) {
      if (urls.video && urls.videoTranscript) {
        sourceInfo.push(
          getSourceContent(
            [urls.slide, urls.video, urls.videoTranscript],
            ["slides", "video", "transcript"]
          )
        )
      } else if (urls.video) {
        sourceInfo.push(getSourceContent([urls.slide, urls.video], ["slides", "video"]))
      } else if (urls.videoTranscript) {
        sourceInfo.push(
          getSourceContent([urls.slide, urls.videoTranscript], ["slides", "transcript"])
        )
      } else {
        sourceInfo.push(getSourceContent([urls.slide], ["slides"]))
      }
    } else if (urls.video && urls.videoTranscript) {
      sourceInfo.push(
        getSourceContent([urls.video, urls.videoTranscript], ["video", "transcript"])
      )
    } else if (urls.video) {
      sourceInfo.push(getSourceContent([urls.video], ["video"]))
    }
    if (urls.shortVideo && urls.shortVideoTranscript) {
      sourceInfo.push(
        getSourceContent(
          [urls.shortVideo, urls.shortVideoTranscript],
          ["short video", "transcript"]
        )
      )
    }
    return sourceInfo
  }
  return (
    <>
      <IconButton
        size={"medium"}
        onClick={(e) => {
          setFilterMenuAnchorEl(e.currentTarget)
        }}
      >
        <FilterListIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={filterMenuAnchorEl}
        open={filterMenuAnchorEl !== null}
        onClose={() => {
          setFilterMenuAnchorEl(null)
        }}
      >
        {filterChoices.map((choice, i) => {
          return (
            <div key={choice}>
              <MenuItem
                key={choice}
                onClick={() => {
                  const newTickedMenus = [...tickedMenus]
                  newTickedMenus[i] = !tickedMenus[i]
                  setTickedMenus(newTickedMenus)
                }}
              >
                <ListItemIcon>
                  {tickedMenus[i] ? (
                    <CheckBoxIcon color="primary" />
                  ) : (
                    <CheckBoxOutlineBlankIcon color="primary" />
                  )}
                </ListItemIcon>
                {choice}
              </MenuItem>
            </div>
          )
        })}
      </Menu>
      <TableSortLabel
            active={true}
            direction={yearOrderByDescending ? "desc" : "asc"}
            onClick={() => {
              const newYearOrderByDescending = !yearOrderByDescending
              setYearOrderByDescending(newYearOrderByDescending)
            }}
          ></TableSortLabel>{`Showing ${yearOrderByDescending ? "latest" : "oldest"} first`}
      {paperInfo.map((paper) => {
        const displayNameEl = paper.authorNames.map((name, i) => {
          const nameString = i === paper.authorNames.length - 1 ? name : `${name}, `
          const isAuthorMe = name.includes(myName)
          const nameEl = isAuthorMe ? <b>{nameString}</b> : <>{nameString}</>
          if (paper.firstAuthors.length === 1 || !paper.firstAuthors.includes(name)) {
            return nameEl
          }
          return (
            <>
              <span style={{ color: "red" }}>&clubs;</span> {nameEl}
            </>
          )
        })
        const urls = paper.urls
        const titleContent = urls.paper ? (
          <a href={urls.paper} target="_blank">
            {paper.title}
          </a>
        ) : (
          <>{paper.title}</>
        )
        const sourceInfo = getSourceInfo(urls)
        const getAcceptanceRateEl = (acceptanceCount?: number, submissionCount?: number) => {
          if (!acceptanceCount || !submissionCount) {
            return <></>
          }
          const acceptanceRate = Math.round((acceptanceCount / submissionCount) * 100)
          return (
            <>
              The acceptance rate was about{" "}
              <b>
                {acceptanceRate}% (={acceptanceCount}/{submissionCount})
              </b>
              .
            </>
          )
        }
        // award more info
        // oral acceptance rate
        return (
          <>
            <p>{titleContent}</p>
            <div>{displayNameEl}</div>
            <div>
              {paper.venueName}. {paper.isOralPresentation ? "Oral Presentation." : null}
            </div>
            {paper.awardInfo ? (
              <>
                <span style={{ color: "red" }}>{paper.awardInfo}</span>
              </>
            ) : null}
            <div>{getAcceptanceRateEl(paper.acceptanceCount, paper.submissionCount)}</div>
            <></>
            <p>{sourceInfo.map((src, i) => (i === sourceInfo.length - 1 ? src : <>{src}, </>))}</p>
          </>
        )
      })}
    </>
  )
}

export default PaperListPage
