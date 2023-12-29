import { IconButton, ListItemIcon, Menu, MenuItem, TableSortLabel } from "@mui/material"
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank"
import FilterListIcon from "@mui/icons-material/FilterList"
import CheckBoxIcon from "@mui/icons-material/CheckBox"
import React from "react"
import fetchPaperInfo from "./fetchPublications"

const myName = "Shuhei Watanabe"
const additionalFilterChoices = ["First Author Papers"]

const styles = {
  paperTitle: {
    marginBottom: "0.0em",
    color: "black",
  },
  venueType: {
    marginBottom: "0.2em",
    color: "#777777",
  },
  acceptanceRateInfo: {
    marginBottom: "0.2em",
    color: "#777777",
  },
};


const getVenueInfoElement = (venueType: string, paperInfo: PaperInfo[]) => {
  if (paperInfo.every((paper) => paper.venueType !== venueType)) {
    return null
  }

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

  return paperInfo
    .filter((paper) => paper.venueType === venueType)
    .map((paper) => {
      const displayNameEl = paper.authorNames.map((name, i) => {
        const nameString = i === paper.authorNames.length - 1 ? `${name}.` : `${name}, `
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
        <a href={urls.paper} target="_blank" style={styles.paperTitle}>
          {paper.title}
        </a>
      ) : (
        <div style={styles.paperTitle}>{paper.title}</div>
      )
      const sourceInfo = getSourceInfo(urls)
      const getAcceptanceRateEl = (acceptanceCount?: number, submissionCount?: number) => {
        if (!acceptanceCount || !submissionCount) {
          return <></>
        }
        const acceptanceRate = Math.round((acceptanceCount / submissionCount) * 100)
        return (
          <div style={styles.acceptanceRateInfo}>
            The acceptance rate was about{" "}
            <b>
              {acceptanceRate}% (={acceptanceCount}/{submissionCount})
            </b>
            .
          </div>
        )
      }
      // award more info
      // oral acceptance rate
      return (
        <>
          <li>
            <p style={{ marginBottom: "0.4em" }}>{titleContent}</p>
            <div style={{ marginBottom: "0.2em" }}>{displayNameEl}</div>
            <div style={styles.venueType}>
              {paper.venueName}. {paper.isOralPresentation ? "Oral Presentation." : null}
            </div>
            {paper.awardInfo ? (
              <>
                <span style={{ color: "red" }}>{paper.awardInfo}</span>
              </>
            ) : null}
            <div style={{ marginBottom: "0.2em" }}>{getAcceptanceRateEl(paper.acceptanceCount, paper.submissionCount)}</div>
            <></>
            <div style={{ marginBottom: "1.0em" }}>
              {sourceInfo.map((src, i) => (i === sourceInfo.length - 1 ? src : <>{src}, </>))}
            </div>
          </li>
          <hr />
        </>
      )
    })
}

const PaperListPage = () => {
  const getVenueChoices = (paperInfo: PaperInfo[]) => {
    const venueTypes = paperInfo.map((paper) => paper.venueType)
    const filterChoices = venueTypes
      .filter((venueType, i) => venueTypes.indexOf(venueType) === i)
      .sort()
    return [...additionalFilterChoices, ...filterChoices]
  }
  const filterChoices = getVenueChoices(fetchPaperInfo())
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = React.useState<null | HTMLElement>(null)
  const [yearOrderByDescending, setYearOrderByDescending] = React.useState(true)
  const [tickedMenus, setTickedMenus] = React.useState([
    ...Array(additionalFilterChoices.length).fill(false),
    ...Array(filterChoices.length - additionalFilterChoices.length).fill(true),
  ])
  console.log(tickedMenus)

  const originalPaperInfo = fetchPaperInfo().sort((paper1, paper2) => {
    const i1 = filterChoices.indexOf(paper1.venueType)
    const i2 = filterChoices.indexOf(paper2.venueType)
    if (i1 !== i2) {
      return i1 - i2
    }

    const yearOrder =
      paper2.publishedYear !== paper1.publishedYear
        ? paper2.publishedYear - paper1.publishedYear
        : paper2.publishedMonth - paper1.publishedMonth
    return yearOrderByDescending ? yearOrder : -yearOrder
  })

  const paperInfo = originalPaperInfo
    .filter((paper) => tickedMenus[filterChoices.indexOf(paper.venueType)])
    .filter((paper) => (tickedMenus[0] ? paper.firstAuthors.includes(myName) : true))

  const venueTypesToInclude = getVenueChoices(paperInfo).slice(1)
  return (
    <>
      <h1>Research Experiences</h1>
      <p>
        Here, I listed the referred papers. <span style={{ color: "red" }}>&clubs;</span>{" "}
        represents the equal contribution.
      </p>
      <p>
        <b>NOTE</b>: I strongly recommend to read the arXiv version (if available) as I update
        papers when needed.
      </p>
      <TableSortLabel
        active={true}
        direction={yearOrderByDescending ? "desc" : "asc"}
        onClick={() => {
          const newYearOrderByDescending = !yearOrderByDescending
          setYearOrderByDescending(newYearOrderByDescending)
        }}
      >{`Showing ${yearOrderByDescending ? "latest" : "oldest"} first`}</TableSortLabel>
      <IconButton
        size={"large"}
        onClick={(e) => {
          setFilterMenuAnchorEl(e.currentTarget)
        }}
      >
        <FilterListIcon fontSize="large" />
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
      {
        <>
          {venueTypesToInclude.map((venueType) => {
            return (
              <>
                <h2 style={{ marginBottom: "0.5em" }}>
                  <b>{venueType}</b>
                </h2>
                <ol type="1">{getVenueInfoElement(venueType, paperInfo)}</ol>
              </>
            )
          })}
        </>
      }
    </>
  )
}

export default function CenteredPaperListPage() {
  return (
    <div className="mx-auto" style={{ minHeight: "100vh", width: "75%", textAlign: "left" }}>
      <PaperListPage />
    </div>
  )
}
