import React from 'react';
import './App.css';
import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import SendIcon from '@material-ui/icons/Send';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import EditIcon from '@material-ui/icons/Edit';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CheckIcon from '@material-ui/icons/Check';
import ClearAllIcon from '@material-ui/icons/ClearAll';
import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';

// TODO: add error pop-ups on catch statements for fetch

class EditForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { open: false };
        this.handleClose = this._handleClose.bind(this);
        this.handleClickOpen = this._handleOpen.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    _handleClose() {
        this.setState({ open: false, value: this.props.Message });
    }

    _handleOpen() {
        this.setState({ open: true, value: this.props.Message });
    }

    handleSubmit(event) {
        const self = this;
        event.preventDefault();
        let formData = new FormData();
        formData.set('id', self.props.Id);
        formData.set('content', self.state.value);
        fetch('http://localhost:'+window.BACKEND_PORT+'/edit', {
            method: 'PUT',
            body: formData
        })
        .then (
            function() {
                self.props.updatePolls();
                self.setState({value: self.props.Message, open: false});
            }
        )
        .catch (function(err) {
            console.log('Fetch error: ' + err);
        });
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    render() {
        return (
            <div className="buttonLine">
                <Button
                    variant="contained"
                    id="editButton"
                    startIcon={<EditIcon />}
                    onClick={this.handleClickOpen}
                >
                    edit
                </Button>
                <Dialog open={this.state.open} onClose={this.handleClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title" className="editbox">Edit message</DialogTitle>
                    <DialogContent>
                    <form onSubmit={this.handleSubmit}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="New message"
                            type="text"
                            defaultValue={this.props.Message}
                            onChange={this.handleChange}
                            fullWidth
                        />
                    </form>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.handleSubmit} color="primary">
                            Submit
                        </Button>
                    </DialogActions>
                </DialogContent>
                </Dialog>
            </div>
        )
    }
}

class IndividualQuestion extends React.Component {
    constructor(props) {
        super(props);
        this.handleLike = this.handleLike.bind(this);
        this.handleDismiss = this.handleDismiss.bind(this);
        this.handleResolution = this.handleResolution.bind(this);
    }

    handleLike() {
        const self = this;
        let formData = new FormData();
        formData.set('id', self.props.Id);
        fetch('http://localhost:'+window.BACKEND_PORT+'/like', {
            method: 'POST',
            body: formData
        })
        .then (
            function() {
                self.props.updatePolls();
            }
        )
        .catch (function(err) {
            console.log('Fetch error: ' + err);
        });
    }

    handleDismiss() {
        const self = this;
        let formData = new FormData();
        formData.set('id', self.props.Id);
        fetch('http://localhost:'+window.BACKEND_PORT+'/dismiss', {
            method: 'DELETE',
            body: formData
        })
        .then (
            function() {
                self.props.updatePolls();
            }
        )
        .catch (function(err) {
            console.log('Fetch error: ' + err);
        });
    }

    handleResolution() {
        const self = this;
        let formData = new FormData();
        formData.set('id', self.props.Id);
        fetch('http://localhost:'+window.BACKEND_PORT+'/resolve', {
            method: 'POST',
            body: formData
        })
        .then (
            function() {
                self.props.updatePolls();
            }
        )
        .catch(function(err) {
            console.log('Fetch error: '+ err);
        });
    }

    render() {
        const resolvedClass = `pollQuestion ${this.props.Resolved ? 'resolved' : ''}`;
        return (
            <ListItem className={resolvedClass}>
                <div className="message">
                    {this.props.Message}
                </div>
                <div className="messagebuttons">
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ThumbUpIcon />}
                        onClick={this.handleLike}
                        className="buttonLine"
                    >
                        like ({this.props.Likes})
                    </Button>
                    <EditForm
                        Id={this.props.Id}
                        Message={this.props.Message}
                        updatePolls={this.props.updatePolls}
                    />
                    <Button
                        variant="contained"
                        startIcon={this.props.Resolved ? <EmojiEmotionsIcon /> : <CheckIcon />}
                        onClick={this.handleResolution}
                        className="buttonLine"
                        id="resolveButton"
                    >
                        {this.props.Resolved ? "Resolved" : "Resolve"}
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<DeleteIcon />}
                        onClick={this.handleDismiss}
                        className="buttonLine"
                    >
                        dismiss
                    </Button>
                </div>
            </ListItem>
        )
    }
}

class PollQuestions extends React.Component {
    constructor(props) {
        super(props);
        this.updatePolls = this.updatePolls.bind(this);
        this.mapMessages = this.mapMessages.bind(this);
    }

    mapMessages(messages) {
        return messages.map((messages) =>
            <IndividualQuestion
                key={messages.id.toString()}
                Id={messages.id}
                Message={messages.content}
                Likes={messages.upvotes}
                updatePolls={this.updatePolls}
                Resolved={messages.resolved}
            />
        );
    }

    scrollToBottom() {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }

    componentDidMount(scroll = 0) {
        const self = this;
        fetch('http://localhost:'+window.BACKEND_PORT+'/get', {
            method: 'GET',
        })
        .then(
            function(serverResponse) {
                serverResponse.json().then(function(postData) {
                    const listItems = self.mapMessages(postData.posts)
                    self.setState({data: listItems})
                    if (scroll) self.scrollToBottom();
                }).catch(function(err) {console.log('Map error:', err)});
            }
        )
        .catch(function(err) {
            console.log('Fetch error: ' + err);
        });
    }

    updatePolls(a = 0) {
        this.componentDidMount(a);
    }

    render() {
        return (
            <List className="pollBox" id="pollbox">
                {this.state && this.state.data}
                <div style={{ float:"left", clear: "both" }}
                    ref={(bottom) => { this.messagesEnd = bottom; }}>
                </div>
            </List>
        );
    }
}

class AskQuestion extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        const self = this;
        event.preventDefault();
        if (self.state.value === "") return;
        let formData = new FormData();
        formData.set('content', self.state.value);
        fetch('http://localhost:'+window.BACKEND_PORT+'/post', {
            method: 'POST',
            body: formData
        })
        .then (
            function() {
                self.props.updatePolls(1);
            }
        )
        .catch (function(err) {
            console.log('Fetch error: ' + err);
        });
        self.setState({value: ''});
    }

    render() {
        return (
            <Container>
                <form onSubmit={this.handleSubmit}>
                    <TextField
                        id="filled-helperText"
                        label="Question"
                        variant="filled"
                        value={this.state.value}
                        onChange={this.handleChange}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SendIcon />}
                        onClick={this.handleSubmit}
                    >
                        POST
                    </Button>
                </form>
            </Container>
        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.updatePolls = this.updatePolls.bind(this);
        this.child = React.createRef();
        this.handleClearAll = this.handleClearAll.bind(this);
    }

    updatePolls(a = 0) {
        this.child.current.updatePolls(a);
    }

    handleClearAll() {
        const self = this;
        fetch('http://localhost:'+window.BACKEND_PORT+'/clear', {
            method: 'DELETE'
        })
        .then (
            function() {
                self.updatePolls();
            }
        )
        .catch (function(err) {
            console.log('Fetch error: ' + err)
        })
    }
    render() {
        return (
            <Container>
                <div className="header">
                    <div className="logo">PollEV Mark II</div>
                    <Button
                        startIcon={<ClearAllIcon/>}
                        color="secondary"
                        className="clearButton"
                        onClick={this.handleClearAll}
                    >
                        clear all
                    </Button>
                </div>
                <PollQuestions Data={[]} ref={this.child}/>
                <div className="separator"/>
                <AskQuestion updatePolls={this.updatePolls}/>
            </Container>
        );
    }
}

export default App;
