import React, { Component } from "react";
import _ from "lodash";

const papa = require("papaparse");

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            apiResponse: "",
            fileValidity: true,
            contactCount: 0
        }
    }

    onFileUploadHandler = (e) => {
        let file = e.target.files[0];
        this.validateFile(file);
    }

    validateFile(file) {

        if (file.type === "text/csv") {
            let that = this;
            papa.parse(file, {
                worker: true,
                step: function(row, parser) {
                    let expectedFirstRow = ["First Name", "Last Name", "Email", "Sex"];
                    if (_.isEqual(expectedFirstRow, row.data)) {
                        that.parseCSV(file);
                    } else {
                        that.setState({ fileValidity: false }, () => {
                            that.renderFileTypeError();
                        });
                    }
                    parser.abort();
                }
            });
        } else {
            this.setState({ fileValidity: false }, () => {
                this.renderFileTypeError();
            });
        }

    }

    renderFileTypeError() {
        let mainContainer = document.getElementById("main");
        let errorContainer = document.createElement("div");
        errorContainer.setAttribute("id", "error-container");
        let errorMessage = document.createElement("p");
        errorMessage.innerHTML = "Error: File must be in the CSV format and follow the correct template with these header rows: 'First Name', 'Last Name', 'Email', 'Sex'.";
        mainContainer.appendChild(errorContainer);
        errorContainer.appendChild(errorMessage);
    }

    renderContactCounter() {
        let mainContainer = document.getElementById("main");
        let counterContainer = document.createElement("div");
        counterContainer.setAttribute("id", "counter-container");
        let counterMessage = document.createElement("p");
        counterMessage.innerHTML = `Success: ${this.state.contactCount} contacts created in OnCall`;
        mainContainer.appendChild(counterContainer);
        counterContainer.appendChild(counterMessage);
    }

    clearMessages() {
        let mainContainer = document.getElementById("main");
        let errorContainer = document.getElementById("error-container");
        let counterContainer = document.getElementById("counter-container");
        if (errorContainer !== null) { mainContainer.removeChild(errorContainer) }
        if (counterContainer !== null) { mainContainer.removeChild(counterContainer) }
    }

    parseCSV(file) {
        let that = this;
        papa.parse(file, {
            worker: true,
            step: function(row) {
                if (row.data[0] !== "First Name") {
                    let requestBody = {};
                    requestBody["first_name"] = row.data[0];
                    requestBody["last_name"] = row.data[1];
                    requestBody["email"] = row.data[2];
                    requestBody["sex"] = row.data[3];
                    requestBody["division"] = "https://api.oncallhealth.ca/divisions/2404/";
                    requestBody["provider"] = "https://api.oncallhealth.ca/providers/196157/";
                    let formattedRequestBody = JSON.stringify(requestBody);
                    that.createRosterContact(formattedRequestBody);
                }
            }
        });
    }

    createRosterContact(bodyParams) {
        fetch("http://localhost:3000/post-new-contact/", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: bodyParams
        })
        .then(res => {
            this.clearMessages();
            if (res.status === 201) {
                this.setState({
                    contactCount: this.state.contactCount + 1
                }, () => {
                    this.renderContactCounter();
                });
            }
        })
        .catch(err => console.log(err));
    }

    render() {
        return (
            <div>
                <div id="main">
                    <h1>Bulk Roster Contact Uploader</h1>
                    <input id="file-upload-input" type="file" name="file" accept=".csv" onChange={this.onFileUploadHandler}/>
                </div>
                <p>{this.state.apiResponse}</p>
            </div>
        );
    }

}

export default App;
