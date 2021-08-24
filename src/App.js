import React, { Component } from "react";

const papa = require("papaparse");

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            file : ""
        }
    }

    parseCSV(file) {
        let that = this;
        papa.parse(file, {
            worker: true,
            step: function(row) {
                if (row.data.indexOf("First Name") !== 0) {
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
            },
            complete: function() {
                console.log("parsing complete");
            }
        });
    }

    onChangeHandler = (e) => {
        this.parseCSV(e.target.files[0]);
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
                <input type="file" name="file" accept=".csv" onChange={this.onChangeHandler}/>
                <p>{this.state.apiResponse}</p>
            </div>
        );
    }

}

export default App;
