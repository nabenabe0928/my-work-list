import { Box, Button, Divider, ListItemIcon, Menu, MenuItem, TableSortLabel } from "@mui/material"
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank"
import FilterListIcon from "@mui/icons-material/FilterList"
import CheckBoxIcon from "@mui/icons-material/CheckBox"
import SortIcon from "@mui/icons-material/Sort"
import DoneAllIcon from "@mui/icons-material/DoneAll"
import ClearAllIcon from "@mui/icons-material/ClearAll"
import React from "react"
import { Container, Row, Col } from "react-bootstrap"
import fetchPaperInfo from "./fetchPublications"
import { myName, availableVenueTypes } from "./constantValues"
import PaperElementBy from "./getPaperElementBy"

const additionalFilterChoices = ["First Author Papers", "Remove Japanese Papers"]

const styles = {
  toolbar: {
    display: "flex",
    flexWrap: "wrap" as const,
    alignItems: "center",
    gap: "0.25em",
    marginTop: "0.75em",
    marginBottom: "1.25em",
    padding: "0.3em 0.5em",
    backgroundColor: "#fafafa",
    border: "1px solid #e8e8e8",
    borderRadius: "8px",
  },
  toolbarGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.25em",
  },
  toolbarSpacer: {
    marginLeft: "auto",
  },
  toolbarDivider: {
    height: "1.4em",
    marginX: "0.4em",
    borderColor: "#dddddd",
  },
  toolbarButton: {
    textTransform: "none" as const,
    color: "#444444",
    fontWeight: 500,
    fontSize: "0.85rem",
    borderRadius: "6px",
    paddingLeft: "0.75em",
    paddingRight: "0.75em",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.06)",
    },
  },
  toolbarIcon: {
    color: "#888888",
  },
}

const PaperListPage = () => {
  const getVenueChoices = (paperInfo: PaperInfo[]) => {
    const venueTypes = paperInfo.map((paper) => paper.venueType)
    const foundVenueTypes = venueTypes.filter(
      (venueType, i) => venueTypes.indexOf(venueType) === i
    )
    const filterChoices = availableVenueTypes.filter((venueType) =>
      foundVenueTypes.includes(venueType)
    )
    return [...filterChoices, ...additionalFilterChoices]
  }
  const filterChoices = getVenueChoices(fetchPaperInfo())
  const numVenueTypes = filterChoices.length - additionalFilterChoices.length
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = React.useState<null | HTMLElement>(null)
  const [groupByMenuAnchorEl, setGroupByMenuAnchorEl] = React.useState<null | HTMLElement>(null)
  const [yearOrderByDescending, setYearOrderByDescending] = React.useState(true)
  const [groupBy, setGroupBy] = React.useState<"venueType" | "year">("venueType")
  const [tickedMenus, setTickedMenus] = React.useState([
    ...Array(numVenueTypes).fill(true),
    ...Array(additionalFilterChoices.length).fill(false),
  ])

  const paperInfo = fetchPaperInfo()
    .sort((paper1, paper2) => {
      const i1 = filterChoices.indexOf(paper1.venueType)
      const i2 = filterChoices.indexOf(paper2.venueType)
      const venueOrder = i1 - i2
      const unsingedYearOrder =
        paper2.publishedYear !== paper1.publishedYear
          ? paper2.publishedYear - paper1.publishedYear
          : paper2.publishedMonth - paper1.publishedMonth
      const yearOrder = yearOrderByDescending ? unsingedYearOrder : -unsingedYearOrder
      if (groupBy === "venueType") {
        return venueOrder !== 0 ? venueOrder : yearOrder
      } else if (groupBy === "year") {
        return yearOrder !== 0 ? yearOrder : venueOrder
      } else {
        console.log(`Got an unexpected groupBy=${groupBy} in sort.`)
        return 0
      }
    })
    .filter((paper) => tickedMenus[filterChoices.indexOf(paper.venueType)])
    .filter((paper) => (tickedMenus.slice(-2)[0] ? paper.firstAuthors.includes(myName) : true))
    .filter((paper) => (tickedMenus.slice(-1)[0] ? !paper.isJapaneseOnly : true))
  // NOTE: When we add another filter choice, we need to add a filter here and add it to additionalFilterChoices.

  const venueTypesToInclude = getVenueChoices(paperInfo).filter(
    (venueType) => !additionalFilterChoices.includes(venueType)
  )
  const getPaperYears = () => {
    // NOTE: paperInfo is already sorted by year when groupBy === "year".
    const years = paperInfo.map((paper) => paper.publishedYear)
    return years.filter((y, i) => years.indexOf(y) === i)
  }
  const yearsToInclude = getPaperYears()
  const tickMark = <span>&#10003;</span>
  const hSpace = <span style={{ visibility: "hidden" }}>&#10003;</span>
  const noSearchFoundComment = "No Search Results Found."

  return (
    <>
      <h1>Research Experiences</h1>
      <p>
        This page lists referred papers. <span style={{ color: "red" }}>&clubs;</span> represents
        the equal contribution.
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
      <Box sx={styles.toolbar}>
        <Button
          sx={styles.toolbarButton}
          startIcon={<FilterListIcon fontSize="small" sx={styles.toolbarIcon} />}
          onClick={(e) => {
            setFilterMenuAnchorEl(e.currentTarget)
          }}
        >
          Filter
        </Button>
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
        <Button
          sx={styles.toolbarButton}
          startIcon={<SortIcon fontSize="small" sx={styles.toolbarIcon} />}
          aria-controls="group-by-menu"
          aria-haspopup="true"
          onClick={(e) => {
            setGroupByMenuAnchorEl(e.currentTarget)
          }}
        >
          Group By
        </Button>
        <Menu
          id="group-by-menu"
          anchorEl={groupByMenuAnchorEl}
          open={Boolean(groupByMenuAnchorEl)}
          onClose={() => setGroupByMenuAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              setGroupByMenuAnchorEl(null)
              setGroupBy("venueType")
            }}
          >
            {groupBy === "venueType" ? tickMark : hSpace}
            {" Venue Type"}
          </MenuItem>
          <MenuItem
            onClick={() => {
              setGroupByMenuAnchorEl(null)
              setGroupBy("year")
            }}
          >
            {groupBy === "year" ? tickMark : hSpace}
            {" Year"}
          </MenuItem>
        </Menu>
        <Box sx={{ ...styles.toolbarGroup, ...styles.toolbarSpacer }}>
          <Divider orientation="vertical" flexItem sx={styles.toolbarDivider} />
          <Button
            sx={styles.toolbarButton}
            startIcon={<DoneAllIcon fontSize="small" sx={styles.toolbarIcon} />}
            onClick={() => {
              setTickedMenus([
                ...Array(numVenueTypes).fill(true),
                ...Array(additionalFilterChoices.length).fill(false),
              ])
            }}
          >
            Select All
          </Button>
          <Button
            sx={styles.toolbarButton}
            startIcon={<ClearAllIcon fontSize="small" sx={styles.toolbarIcon} />}
            onClick={() => {
              setTickedMenus(new Array(tickedMenus.length).fill(false))
            }}
          >
            Unselect All
          </Button>
        </Box>
      </Box>
      {paperInfo.length === 0 ? (
        <>
          <p>{noSearchFoundComment}</p>
        </>
      ) : groupBy === "venueType" ? (
        <>
          {venueTypesToInclude.map((venueType) => {
            return (
              <>
                <h2 style={{ marginBottom: "0.5em" }}>
                  <b>{venueType}</b>
                </h2>
                <ol type="1">{<PaperElementBy paperInfo={paperInfo} venueType={venueType} />}</ol>
              </>
            )
          })}
        </>
      ) : groupBy === "year" ? (
        <>
          {yearsToInclude.map((year) => {
            return (
              <>
                <h2 style={{ marginBottom: "0.5em" }}>
                  <b>{year}</b>
                </h2>
                <ol type="1">{<PaperElementBy paperInfo={paperInfo} year={year} />}</ol>
              </>
            )
          })}
        </>
      ) : null}
    </>
  )
}

export default function CenteredPaperListPage() {
  return (
    <Container fluid style={{ height: "100vh" }}>
      <Row className="justify-content-md-center">
        <Col xs={12} md={10} lg={7}>
          <PaperListPage />
        </Col>
      </Row>
    </Container>
  )
}
