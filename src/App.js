import React, {Component} from 'react';
import {Map, Marker, TileLayer, Popup} from "react-leaflet";
import 'leaflet/dist/leaflet.css'
import {Sidebar, Tab} from 'react-leaflet-sidetabs'
import {FaMapMarkedAlt, FaExternalLinkAlt} from "react-icons/fa";
import {FiHome, FiChevronRight, FiSearch, FiSettings} from "react-icons/fi";
import L from 'leaflet';
import IQPTable from "./Components/IQPTable";
import TableData from './Components/IQPTableData'
import projectCenters from "./Components/IQPLocations";
import Grid from "@material-ui/core/Grid";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import './App.css';
import {Button} from "@material-ui/core";
import {ExportToCsv} from 'export-to-csv';
import Box from "@material-ui/core/Box";
import WPI from './imgs/WPI_Inst.png';
import WPISmall from './imgs/WPI_Small.png';
import text from './imgs/txt.png';
import CheckBoxJSON from "./files/checkbox";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

var popup = L.popup();

let selectedCountry = 'home';
let earliestDate = '1997-12-01';
let earliestDate1;
let earliestDate2;
let latestDate = '2020-09-28';
let latestDate1;
let latestDate2;

let earliestDateNum = 19971201;
let latestDateNum = 20200928;
let CenterInfo = [];
let CenterInfoClone = [];
let subterms = [];

function FindingProjectCenters() {
    projectCenters.forEach(function (key) {
        TableData.forEach(function (Center) {
            if (key.name === Center.ProjectCenter) {
                CenterInfo.push(Center);
            }
        });
    })
    CenterInfoClone = CenterInfo;
}

FindingProjectCenters();


const options = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    showTitle: true,
    title: 'Climate Change',
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: true,
    // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
};

const csvExporter = new ExportToCsv(options);

console.log(CheckBoxJSON);

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: true,
            selected: 'home',
            checkedBox: true,
        };
    }

    onClose() {
        this.setState({collapsed: true});
    }

    onOpen(id) {
        if (id === "Externallink") {
            this.setState({
                collapsed: true,
                selected: id,
            })
            window.open('https://global-lab.github.io/SubjectTerms/', '_blank')
        }
        else {
            this.setState({
                collapsed: false,
                selected: id,
            })
        }
    }

    handleClick = (country) => (e) => {
        selectedCountry = country;
        this.filterfunction();
    }

    handleButtonClick = () => (e) => {
        selectedCountry = "home";
        earliestDate = '1997-12-01';
        earliestDate1 = earliestDate.replace('-', '');
        earliestDate2 = earliestDate1.replace('-', '');
        earliestDateNum = parseInt(earliestDate2);
        latestDate = '2020-09-28';
        latestDate1 = latestDate.replace('-', '');
        latestDate2 = latestDate1.replace('-', '');
        latestDateNum = parseInt(latestDate2);
        CenterInfo = [];
        projectCenters.forEach(function (key) {
            TableData.forEach(function (Center) {
                if (key.name === Center.ProjectCenter) {
                    CenterInfo.push(Center);
                }
            });
        })
        CheckBoxJSON.map(function (checkbox) {
            checkbox.Box = false;
        })
        this.onOpen("settings");
    }

    handleEarliestChange = (e) => {
        earliestDate = e.target.value;
        console.log(earliestDate);
        earliestDate1 = earliestDate.replace('-', '');
        console.log(earliestDate1);
        earliestDate2 = earliestDate1.replace('-', '');
        console.log(earliestDate2);
        earliestDateNum = parseInt(earliestDate2);
        this.filterfunction();
    }

    handleLatestChange = (e) => {
        latestDate = e.target.value;
        latestDate1 = latestDate.replace('-', '');
        latestDate2 = latestDate1.replace('-', '');
        latestDateNum = parseInt(latestDate2);
        this.filterfunction();
    }

    filterfunction = () => {
        CenterInfo = [];
        if (selectedCountry === 'home') {
            CenterInfoClone.forEach(function (Center) {
                let CEdate = Center.DateCreated
                let Terms = Center.GeneralTerms.split("|")
                if ((CEdate > earliestDateNum) && (CEdate < latestDateNum)) {
                    if (subterms.length === 0){
                        CenterInfo.push(Center);
                    }
                    else {
                        subterms.forEach(function (subterm) {
                            Terms.forEach(function (centerterm) {
                                if (subterm === centerterm) {
                                    CenterInfo.push(Center);
                                }
                            })
                        })
                    }
                }
            });
        }
        CenterInfoClone.forEach(function (Center) {
            let CEdate = Center.DateCreated
            let Terms = Center.GeneralTerms.split("|")
            if (selectedCountry === Center.ProjectCenter) {
                if ((CEdate > earliestDateNum) && (CEdate < latestDateNum)) {
                    if (subterms.length === 0){
                        CenterInfo.push(Center);
                    }
                    else {
                        subterms.forEach(function (subterm) {
                            Terms.forEach(function (centerterm) {
                                if (subterm === centerterm) {
                                    CenterInfo.push(Center);
                                }
                            })
                        })
                    }
                }
            }
        });

        this.onOpen("settings");
    }

    handleCSVClick = () => (e) => {
        csvExporter.generateCsv(CenterInfo);
    }

    handleCheckbox = (e, isChecked) => {
        let term = e.target.value
        CheckBoxJSON.map(function (d) {
            if ( d.Name === term) {
                d.Box = true;
            }
        });
        isChecked ? subterms.push(term) : subterms = subterms.filter(e => e !== term)
        this.filterfunction();
    }

    handleExternalClick = () => {
        window.location.assign('https://global-lab.github.io/ProjectCenters/');
    }

    findBool = (name) => {
        let bol = false;
        CheckBoxJSON.forEach(function (d) {
            if (d.Name === name) {
                bol = d.Box;
            }
        });
        return bol;
    }



    render() {
        return (
            <div>
                <div className="Header">
                    <img src={text} alt="WIN"/>
                </div>
                <div className="WPILogo">
                    <img src={WPI} alt="WPI"/>
                </div>
                <div className="WPISmall">
                    <img src={WPISmall} alt="WPI"/>
                </div>
                <Sidebar
                    id="sidebar"
                    position="right"
                    collapsed={this.state.collapsed}
                    closeIcon={<FiChevronRight/>}
                    selected={this.state.selected}
                    onOpen={this.onOpen.bind(this)}
                    onClose={this.onClose.bind(this)}
                >
                    <Tab id="settings" header="Project Centers" icon={<FaMapMarkedAlt/>}>
                        <Box mt={2}/>
                        <div>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <form noValidate>
                                        <TextField
                                            id="date"
                                            label="Earliest project date:"
                                            value={earliestDate}
                                            onChange={this.handleEarliestChange}
                                            type="date"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </form>
                                </Grid>
                                <Grid item xs={6}>
                                    <form noValidate>
                                        <TextField
                                            id="date"
                                            label="Latest project date:"
                                            type="date"
                                            ref="Latest"
                                            value={latestDate}
                                            onChange={this.handleLatestChange}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </form>
                                </Grid>
                            </Grid>
                        </div>
                        <Box mt={2}/>
                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <Button style={{
                                    backgroundColor: "#0074d9",
                                }}
                                        onClick={this.handleButtonClick()}
                                        variant="contained" color="primary">
                                    Clear
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button style={{
                                    backgroundColor: "#0074d9",
                                }}
                                        onClick={this.handleCSVClick()}
                                        variant="contained" color="primary">
                                    Dowload .CSV based on your filters
                                </Button>
                            </Grid>
                        </Grid>
                        <Box mt={2}/>
                        <Grid container spacing={1}>
                            <Grid container item xs={12} spacing={0}>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Accessibility"
                                                checked={this.findBool("Accessibility")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Accessibility"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Animals"
                                                checked={this.findBool("Animals")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Animals"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Biomedical"
                                                checked={this.findBool("Biomedical")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Biomedical"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Business and Economics"
                                                checked={this.findBool("Business and Economics")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Business and Economics"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Children"
                                                checked={this.findBool("Children")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Children"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Climate Change"
                                                checked={this.findBool("Climate Change")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Climate Change"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Community Engagement"
                                                checked={this.findBool("Community Engagement")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Community Engagement"
                                    />
                                </Grid>
                            </Grid>
                            <Grid container item xs={12} spacing={0}>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Computing"
                                                checked={this.findBool("Computing")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Computing"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Culture and Language"
                                                checked={this.findBool("Culture and Language")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Culture and Language"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Education"
                                                checked={this.findBool("Education")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Education"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Emerging Technologies"
                                                checked={this.findBool("Emerging Technologies")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Emerging Technologies"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                Accessibility
                                                name="checkedB"
                                                color="primary"
                                                value="Energy"
                                                checked={this.findBool("Energy")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Energy"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Environmental Management"
                                                checked={this.findBool("Environmental Management")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Environmental Management"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Food"
                                                checked={this.findBool("Food")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Food"
                                    />
                                </Grid>
                            </Grid>
                            <Grid container item xs={12} spacing={0}>
                                <Grid item xs={1.2}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Health and Wellbeing"
                                                checked={this.findBool("Health and Wellbeing")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Health and Wellbeing"
                                    />
                                </Grid>
                                <Grid item xs={1.2}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="History"
                                                checked={this.findBool("History")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="History"
                                    />
                                </Grid>
                                <Grid item xs={1.2}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Industry and Manufacturing"
                                                checked={this.findBool("Industry and Manufacturing")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Industry and Manufacturing"
                                    />
                                </Grid>
                                <Grid item xs={1.2}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Infrastructure/Buildings"
                                                checked={this.findBool("Infrastructure/Buildings")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Infrastructure/Buildings"
                                    />
                                </Grid>
                                <Grid item xs={1.2}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Innovation and Entrepreneurship"
                                                checked={this.findBool("Innovation and Entrepreneurship")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Innovation and Entrepreneurship"
                                    />
                                </Grid>
                                <Grid item xs={1.2}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Interactive Media"
                                                checked={this.findBool("Interactive Media")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Interactive Media"
                                    />
                                </Grid>
                            </Grid>
                            <Grid container item xs={12} spacing={0}>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="International Relations"
                                                checked={this.findBool("International Relations")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="International Relations"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Libraries and Archives"
                                                checked={this.findBool("Libraries and Archives")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Libraries and Archives"
                                    />

                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Materials"
                                                checked={this.findBool("Materials")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Materials"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Museum"
                                                checked={this.findBool("Museum")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Museum"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Natural Resources"
                                                checked={this.findBool("Natural Resources")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Natural Resources"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Organizational Management"
                                                checked={this.findBool("Organizational Management")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Organizational Management"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Policy"
                                                checked={this.findBool("Policy")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Policy"
                                    />
                                </Grid>
                            </Grid>
                            <Grid container item xs={12} spacing={0}>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Politics"
                                                checked={this.findBool("Politics")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Politics"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Public Engagement"
                                                checked={this.findBool("Public Engagement")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Public Engagement"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Public Services"
                                                checked={this.findBool("Public Services")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Public Services"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Recreation"
                                                checked={this.findBool("Recreation")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Recreation"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Rural Development"
                                                checked={this.findBool("Rural Development")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Rural Development"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Security"
                                                checked={this.findBool("Security")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Security"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Social Justice"
                                                checked={this.findBool("Social Justice")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Social Justice"
                                    />
                                </Grid>
                            </Grid>
                            <Grid container item xs={12} spacing={0}>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Space"
                                                checked={this.findBool("Space")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Space"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Sustainable Development"
                                                checked={this.findBool("Sustainable Development")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Sustainable Development"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Tourism"
                                                checked={this.findBool("Techniques")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Techniques"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Tourism"
                                                checked={this.findBool("Tourism")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Tourism"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Transportation"
                                                checked={this.findBool("Transportation")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Transportation"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Urban Plannings"
                                                checked={this.findBool("Urban Plannings")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Urban Plannings"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Water"
                                                checked={this.findBool("Water")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Water"
                                    />
                                </Grid>
                                <Grid item xs={1.7}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="checkedB"
                                                color="primary"
                                                value="Women"
                                                checked={this.findBool("Women")}
                                                onChange={this.handleCheckbox}
                                            />
                                        }
                                        label="Women"
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Box mt={2}/>
                        <IQPTable tabledata={CenterInfo}/>
                        <Box mt={2}/>
                        <Button style={{
                            backgroundColor: "#0074d9",
                        }}
                                onClick={this.handleButtonClick()}
                                variant="contained" color="primary">
                            Clear
                        </Button>
                    </Tab>
                     <Tab id="Externallink" icon={<FaExternalLinkAlt/>} />
                </Sidebar>
                <Map style={{height: "100vh", width: "100%"}} className="mapStyle" center={[0, 0]} zoom={3}>
                    <TileLayer
                        attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
                        url={'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'}
                    />
                    {projectCenters.map((center, k) => {
                        let position = [center["coordinates"][0], center["coordinates"][1]]
                        return (
                            <Marker
                                key={k}
                                onMouseOver={(e) => {
                                    e.target.openPopup();
                                }}
                                onMouseOut={(e) => {
                                    e.target.closePopup();
                                }}
                                onClick={this.handleClick(center.name)}
                                position={position}
                            >
                                <Popup> {center.name} </Popup>
                            </Marker>
                        )
                    })
                    }
                </Map>
            </div>
        )
    }
}

