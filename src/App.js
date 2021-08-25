import React, { Component } from "react";
import _ from "lodash";

const papa = require("papaparse");

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            fileValidity: true
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
                            that.renderFileTypeError()
                        });
                    }
                    parser.abort();
                }
            });
        } else {
            this.setState({ fileValidity: false }, () => {
                this.renderFileTypeError()
            });
        }

    }

    renderFileTypeError() {
        let statusContainer = document.getElementById("status-container");
        let errorMessage = document.createElement("p");
        errorMessage.innerHTML = "File must be in the CSV format and follow the correct template with these header rows: 'First Name', 'Last Name', 'Email', 'Sex'.";
        statusContainer.appendChild(errorMessage);
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
        .then(res => res.text())
        .then(res => this.setState({ apiResponse: res }))
        .catch(err => console.log(err));
    }

    render() {
        return (
            <div>
                <div id="status-container"></div>
                <input type="file" name="file" accept=".csv" onChange={this.onFileUploadHandler}/>
                <p>{this.state.apiResponse}</p>
            </div>
        );
    }

}

export default App;
