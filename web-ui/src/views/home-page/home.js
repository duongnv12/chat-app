import React from "react";

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        name: "World",
        };
    }

    render() {
        return (
            <React.Fragment>
                <div>
                    <h1>Hello, {this.state.name}!</h1>
                    <p>Welcome to the home page.</p>
                </div>
                <div>
                    <h2>About Us</h2>
                    <p>This is a simple React application.</p>
                </div>

            </React.Fragment>
        );
    }
}
export default Home;