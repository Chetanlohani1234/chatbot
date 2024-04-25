"use client";
import React, { useEffect, useState } from 'react'
import styles from '@/styles/RightSection.module.css'
import chatgptlogo from '@/assets/chatgptlogo.png'
import chatgptlogo2 from '@/assets/chatgptlogo2.png'
import nouserlogo from '@/assets/nouserlogo.png'
import editlogo from '@/assets/pen.png'
import Image from 'next/image'
// import schoolbg from '@/assets/schoolBG.jpg'
import { HashLoader } from 'react-spinners';
import { ChangeEvent } from 'react';
import { Stream } from 'stream';



//const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API
const API_URL = 'https://13.234.60.30/api/generate';



// console.log(API_KEY)
const RightSection = () => {
    const trainingPrompt = [
        {
            "role": "user",
            "parts": [{
                "text": "This is Introductory dialogue for any prompt :  'Hello, my dear friend, I am the CHATGPT Bot. Ask me anything regarding procurement, purchase, and logistics. I will be happy to help you. '"

            }]
        },
        {
            "role": "model",
            "parts": [{
                "text": "okay"
            }]
        },
        {
            "role": "user",
            "parts": [{
                "text": "Special Dialogue 1 : if any prompt mentions 'Shashi Shahi' word :  'Ofcourse! Dr. Shashi Shahi is one of the prominent professors at UWindsor! He is an IIT-D alumni with year of invaluable experience and a fun way of engaging in lectures!' 'Likes: Analytics and Research and Case Studies ''Dislikes: Students near riverside.'"
            }]
        },
        {
            "role": "model",
            "parts": [{
                "text": "okay"
            }]
        },
        {
            "role": "user",
            "parts": [{
                "text": "Special Dialogue 2 : Any prompt that mentions CHATGPT class / classroom  A : ' The CHATGPT Batch of 2023 is by far the best the university has ever seen by all sets of standards. Students from different come together to form a truly diverse and culturally rich classroom experience. I believe that all students are highly capable and will achieve all great things in their professional career!' "
            }]
        },
        {
            "role": "model",
            "parts": [{
                "text": "okay"
            }]
        }
    ]
    const [message, setMessage] = useState('')
    const [isSent, setIsSent] = useState(true)
    const [image, setImage] = useState('');
    // const [file, setFile] = useState<File | null>(null); 
    const [file, setFile] = useState('');
    const [allMessages, setAllMessages] = useState<any[]>([])
    const [isTyping, setIsTyping] = useState(false);
    const [typedMessage, setTypedMessage] = useState('');

    const [editMode, setEditMode] = useState(false);
    const [editText, setEditText] = useState('');
    const [originalText, setOriginalText] = useState('');

    const [editedText, setEditedText] = useState(''); // State to hold the edited text
    const [editIndex, setEditIndex] = useState(-1); 




    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => { // Correct usage of ChangeEvent
        const file = e.target.files && e.target.files[0];
        
        

        if (file) {
            setFile(file.name);
            setMessage('What is in this picture?');
            
            const reader = new FileReader();
            reader.onloadend = () => {
                // Convert image to base64 and set the state
                if (typeof reader.result === 'string') {
                // Remove the data URL prefix and set only the base64 encoded image string
                const base64String = reader.result.split(',')[1];
                setImage(base64String);
                }
            };
            reader.readAsDataURL(file);
        }
    };


    const sendMessage = async () => {
        setIsSent(false);
        setIsTyping(true);
    
        try {
            // Store the user's question separately
            const userQuestion = {
                role: 'user',
                parts: [{ text: message }]
            };

                    // Prepare the request body
        let bodyContent:any = {
            model: 'mistral',
            prompt: message,
            stream: true,
        };

        // Include image in the request body if available
        if (image) {
            bodyContent.images = [image];
        }


        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyContent),
        });

    
            // const response = await fetch(API_URL, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({
            //         model: 'mistral',
            //         prompt: message,
            //         stream: true,
            //         images: [image],
            //     }),
            // });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Check if response body exists before proceeding
            if (!response.body) {
                throw new Error('Response body is null');
            }
    
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';
    
            while (true) {
                const { done, value } = await reader.read();
    
                if (done) {
                    break;
                }
    
                const decodedChunk = decoder.decode(value, { stream: true });
                fullResponse += decodedChunk;
                //console.log("Response chunk:", decodedChunk);
            }
    
            // Parse the fullResponse as JSON
            const lines = fullResponse.split('\n');
            let concatenatedResponse = '';
            for (const line of lines) {
                if (line.trim() !== '') {
                    const responseData = JSON.parse(line);
                    console.log("response data: ", responseData);
    
                    // Concatenate each response into a single string
                    if (responseData.response) {
                        concatenatedResponse += responseData.response + ' ';
                        console.log("object",concatenatedResponse);
                    }
                }
            }
    
            // Update state with the concatenated response
            setAllMessages(prevMessages => [
                ...prevMessages,
                userQuestion,
                {
                    role: 'model',
                    //parts: [{ text: concatenatedResponse.trim() }],
                    //parts: [{ text: concatenatedResponse}],
                    parts: [{ text: ''}],


                },
            ]);

            // Split the concatenated response into an array of characters
            const responseCharacters = concatenatedResponse.split('');

            // Loop through each character with a delay between each one
            for (let i = 0; i < responseCharacters.length; i++) {
                setTimeout(() => {
                    // Update the last message in allMessages with the next character
                    setAllMessages(prevMessages => [
                        ...prevMessages.slice(0, -1), // keep previous messages unchanged
                        {
                            ...prevMessages[prevMessages.length - 1], // keep the rest of the last message unchanged
                            parts: [{ text: prevMessages[prevMessages.length - 1].parts[0].text + responseCharacters[i] }], // append the next character to the existing text
                        },
                    ]);
                }, i * 10); // Change the delay as needed (100 milliseconds in this example)
            }

                // After displaying all characters, update the state to mark message as fully sent
                setTimeout(() => {
                    setIsSent(true);
                    setIsTyping(false);
                    setMessage('');
                    setFile('');
                }, concatenatedResponse.length * 10); // Wait until all characters are displayed before marking as fully sent
    
            setIsSent(true);
            setIsTyping(false);
            setMessage('');
            setFile('');
        } catch (error) {
            console.error('Error:', error);
            setIsSent(true);
        }
    };

    
   // console.log("All image: ",allMessages);

    // const handleEditClick = (text:string) => {
    //    // console.log("chetan loahnio");
    //     setEditMode(true);
    //     setOriginalText(text); // Assuming msg contains the user' message
    //     setEditText(text);
    // };

    const handleEditClick = (text: string, index: number) => {
        // Set the original text to be edited
        setEditedText(text);
        // Set the index of the message being edited
        setEditIndex(index);
    };

    // const handleSaveEdit = () => {
    //     // Update the text in the message with the edited text
    //     setAllMessages(prevMessages => {
    //         const updatedMessages = [...prevMessages];
    //         updatedMessages[editIndex].parts[0].text = editedText;
    //         return updatedMessages;
    //     });
    //     // Clear the edited text and reset the edit index
    //     setEditedText('');
    //     setEditIndex(-1);
    // };

        const handleSaveEdit = async () => {
            try {
                // Send an API request with the edited message
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'mistral',
                        prompt: editedText, // Send the edited text as the prompt
                        stream: true,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                // Update the text in the message with the edited text
                setAllMessages(prevMessages => {
                    const updatedMessages = [...prevMessages];
                    updatedMessages[editIndex].parts[0].text = editedText;
                    return updatedMessages;
                    //console.log("message updated : ",updatedMessages);
                });
                console.log("updated message : ",allMessages);
                // Clear the edited text and reset the edit index
                setEditedText('');
                setEditIndex(-1);

                // Handle the response as needed
            } catch (error) {
                console.error('Error:', error);
            }
        };



    const handleCancelEdit = () => {
        // Clear the edited text and reset the edit index
        setEditedText('');
        setEditIndex(-1);
    };
    console.log("object:",message);

    return (
        <div className={styles.rightSection}>
            {/* <Image src={schoolbg} alt="" className={styles.schoolbg} /> */}
            <div className={styles.rightin}>
                <div className={styles.chatgptversion}>
                    <p className={styles.text1}>rootAI Chat</p>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>

                </div>


                {
                    allMessages.length > 0 ?
                        <div className={styles.messages}>
                            {allMessages.map((msg, index) => (
                                <div key={index}
                                 className={styles.message}
                                 >
                                    <Image src={msg.role === 'user' ? nouserlogo : chatgptlogo2} width={50} height={50} alt="" />
                                    <div className={`${styles.details} typewriter`}>
                                        <h2>{msg.role === 'user' ? 'You' : 'CHATGPT Bot'}</h2>
                                        {/* <p>{msg.parts[0].text}</p> */}
                                        {/* <p>{msg.parts[1].text}</p> */}
                                        <p>
                            {editIndex === index ? (
                                <input
                                style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: 'white',
                                    padding: '0',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit',
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    lineHeight: '1.5',
                                    resize: 'none', // Prevent resizing
                                    overflow: 'hidden',
                                    display: 'inline', // Make it inline
                                }}
                                    type="text"
                                    value={editedText}
                                    onChange={e => setEditedText(e.target.value)}

                                />
                            ) : (
                                msg.parts[0].text
                            )}
                        </p>
{/*                                        
                                        {msg.role === 'user' && (
                                            <div className={styles.userIcon} >
                                                <Image 
                                                  onClick={() => handleEditClick(msg.parts[0].text,index)}
                                                    src={editlogo} // Set user icon source
                                                    width={50} 
                                                    height={50} 
                                                    alt="User Icon" 
                                                />
                                            </div>
                                        )} */}
 
                               {editIndex === index && (
                                    <div>
                                        <button onClick={handleSaveEdit}>Save</button>
                                        {/* <button onClick={sendMessage}>save</button> */}
                                        <button onClick={handleCancelEdit}>Cancel</button>
                                    </div>
                                )}

                                    {/* <input 
                                        type="text" 
                                        value={editText} 
                                        onChange={(e) => setEditText(e.target.value)} 
                                    /> */}

                                        {/* <p className={msg.role === 'model' && isTyping ? 'typing-animation' : ''}>{msg.parts[0].text}</p> */}
                                    </div>
                                </div>
                            ))}
                        </div>
                        :
                        <div className={styles.nochat}>
                            <div className={styles.s1}>
                                {/* <Image src={chatgptlogo} alt="chatgpt" height={70} width={70} /> */}
                                <h1>How can I help you today?</h1>
                            </div>
                            <div className={styles.s2}>
                                <div className={styles.suggestioncard}>
                                    <h2>Recommend activities</h2>
                                    <p>psychology behind decision-making</p>
                                </div>
                                <div className={styles.suggestioncard}>
                                    <h2>Recommend activities</h2>
                                    <p>psychology behind decision-making</p>
                                </div>
                                <div className={styles.suggestioncard}>
                                    <h2>Recommend activities</h2>
                                    <p>psychology behind decision-making</p>
                                </div>
                                <div className={styles.suggestioncard}>
                                    <h2>Recommend activities</h2>
                                    <p>psychology behind decision-making</p>
                                </div>
                            </div>

                        </div>
                }

                <div className={styles.bottomsection}>
                    <div className={styles.messagebar}>
                        <input type='text' placeholder='Message rootAI Bot...'
                            onChange={(e) => setMessage(e.target.value)}
                            value={message}
                        />

       <div>
            {/* Conditionally render "Choose file" label */}
            {!file && <label style={{ display: 'inline-block', cursor: 'pointer',fontSize:'15px',marginRight:'30px',color:'#ffffff'}} htmlFor="fileInput">Choose file</label>}

            {/* File input */}
            <input
                id="fileInput"
                type="file"
                onChange={handleImageChange}
                style={{ display: 'none' }} // Hide the file input
            />

            {/* Render the file name only if a file is selected */}
            {file && <p style={{ display: 'inline-block', marginLeft: '10px' }}>{file}</p>}
        </div>

                        {/* <input type='file' 
                        onChange={handleImageChange}/>
                        {file && <p>{file}</p>} */}
                        


                        {
                            isSent ?
                                <svg
                                    onClick={sendMessage}
                                     //onClick={() => setMessage(message.trim())}
                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                                </svg>
                                :
                                <HashLoader color="#36d7b7" size={30} />
                        }

                    </div>
                    <p>rootAI BOT can make mistakes. Consider checking important information.</p>

                </div>
            </div>
        </div>
    )
}

export default RightSection;