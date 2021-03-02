import React, { createRef } from 'react';
import io from 'socket.io-client';


export default class LoginForm extends React.PureComponent {
    state = {
        media: [],
        username: '',
        mediaSelectionOpen: false,
        user: [{
            user: null,
            mediaSelections: []
        }],
        acceptedTerms: false,
        id: null,
        onlinePlayers: 0,
        stream: null
    }

    socketRef = createRef()
    
    componentDidMount() {

        this.socketRef = io.connect('/');
        const { socketRef } = this;

        socketRef.on('player-id', id => {
            this.setState({id});
        })

        socketRef.on('player-joined', numberOfPlayers => {
            this.setState({onlinePlayers: numberOfPlayers })
        })

        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        })
        .then(stream => {
            const video = document.getElementById('video');

            if (video) {
                video.srcObject = stream;
            }
        })
        .catch(this.videoError)
    }

    openMediaSelection = (e) => {
        this.setState({mediaSelectionOpen: !this.state.mediaSelectionOpen})
    }
    
    renderMediaSelection = () => {
        const socialMedia = ['Tik', 'Ins', 'Twi', 'OF']
        return (
            <>
            <div className="media--selection--container" >
                <div className="media--selection--menu">
                    {socialMedia.map(mediaName => {
                        return (  
                            <button className={this.state.media.includes(mediaName) ? 
                                "media--selection--item__selected" : "media--selection--item"}
                                onClick={() => this.setMedia(mediaName)}
                                >
                            <span>{mediaName}</span>
                        </button>
                        )
                    })}
                </div>
                <span className="select--multiple">Select multiple with the same @ </span>
            </div>        
            </>
        )
    }
    
    handleChange = (e) => {
        this.setState({username: e.target.value})
    }
    
    renderMediaIcons = () => {
		return (
			<div className="media--icons--container">
				{this.state.media.map((mediaIcon, i) => {
					return  (
						<div>
							<span>
								{mediaIcon}
							</span>
						</div>
					)
				})}
			</div>
		)
    }

    setMedia = (newMedia) => {  
        this.state.media.includes(newMedia) ? 
        
        this.setState((currentState) => {

            const updatedMedia = currentState.media.filter(mediaItem => 
                mediaItem !== newMedia
            )

            return {media: [...updatedMedia]}
        }) :
        this.setState((currentState) => {
            return {media: [...currentState.media, newMedia]}
        })
    }
    
    addMedia = () => {
        const newDetails = {
            username: this.state.username,
            mediaSelections: this.state.media
        }
        console.log(newDetails)
        this.setState((currentState) => { 
            return {
                media: [], username: '', mediaSelectionOpen: false, user: [ ...currentState.user, newDetails ]
            }
        })
    }

    videoError = (error) => {
        alert(error, "ERROR")
    }

    renderMediaAndUserName = () => {

        const {state: { user }} = this;

        return user.map((userObj, i) => {
            return (
                <div className="selected--user__container" key={i}>
                    <div className="selected--user--socials__container">
                        {userObj.mediaSelections.map((mediaSelection, i) => {
                            return (
                            <div className="media--selection" key={i}>
                                <span>
                                    {mediaSelection}
                                </span>
                            </div>
                            )
                        })}
                    </div>
                    <div className="selected--user__username">
                        <span>
                            {userObj.username}
                        </span>
                    </div>
                </div>
            )
        })
    }

    renderSelectedMedia = (user) => {
        return user.map((userObj, i) => {
            
            return userObj.mediaSelections.map((media, i) => {
                return ( 
                    <div key={i}>
                        <span>
                            {media}
                        </span>
                   </div>
                )
            })
        })
    }

    toggleTermsAndConditions = () => {
        this.setState({acceptedTerms: !this.state.acceptedTerms})
    }

    login = () => {
        const userDetails = this.state.user;
        this.socketRef.emit('user-logged-in', userDetails[0])
    }

    render() {
        console.log(this.state.stream)
        return (
            <>
            <video className="background" id="video" autoPlay={true} />
                <div className="login--form--container">
                    <div className="login--form--title--container">
                        <h1>
                            Follottery
                        </h1>
                    </div>
                        <div className="set--socials__container">
                            {this.state.user.length > 0 && this.renderMediaAndUserName()}
                        </div> 
                    <div className="login--form--content--container">
                    {this.state.mediaSelectionOpen && this.renderMediaSelection()}
                    {this.state.media.length > 0 && this.renderMediaIcons()}
                        <div className="input--container">
                            <label className="username--input">
                                <input 
                                    type="text" 
                                    placeholder="Enter your @'s" 
                                    value={this.state.username}
                                    onClick={this.openMediaSelection} 
                                    onChange={this.handleChange}
                                />
                            </label>
                            <button 
                            className={this.state.media.length > 0 && this.state.username ?
                            'submit--button__active' 
                            :'submit--button'}
                            onClick={
                            this.state.media.length > 0 && 
                            this.state.username ? this.addMedia : null}
                            >
                                +
                            </button>
                        </div>
                        <label className="checkbox--input">
                            <input type="checkbox" onClick={this.toggleTermsAndConditions}/>  
                            <span>
                                I have read and accept the terms and conditions
                            </span>
                        </label>
                        <button 
                        className={
                            this.state.acceptedTerms && this.state.user.length > 0 ? "lobby--button__active" : "lobby--button"
                        }
                        onClick={this.login}
                        >
                            Go To Lobby
                        </button>
                    </div>
                </div>
            </>
        )
    }
}


/* 
- when a user clicks on a social media button, the button value gets
added to state. X

- a user should only be able to choose a social once. X

- the array of social media icons are mapped and rendered X

- user should be able to add remove icons  X

- user can only begin typing once they've selected at least 1 social X

- + button is greyed out until a social is chosed and at least 1 letter typed X

- socials are again rendered to top right x

- user must accept terms 

- lobby button becomes active

- clean up rendered social icons



*/