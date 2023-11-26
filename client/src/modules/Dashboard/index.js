import {useEffect, useRef, useState} from 'react'
import Img1 from '../../assets/img1.jpg'
import humain from '../../assets/humain.png'
import new_message from '../../assets/no-message.jpg'
import Input from '../../components/Input'
import {io} from 'socket.io-client'
import {useDropzone} from 'react-dropzone';


const Dashboard = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user:detail')))
    const [conversations, setConversations] = useState([])
    //mod by smart
    const [contactsExist, setContactsExist] = useState(true);

    const [selectedImage, setSelectedImage] = useState(null); // no ok

    const [activeUsers, setActiveUsers] = useState([]);


    const [messages, setMessages] = useState({})
    const [message, setMessage] = useState('')
    const [users, setUsers] = useState([])
    const [socket, setSocket] = useState(null)
    const messageRef = useRef(null)


    const isMounted = useRef(true);


    useEffect(() => {
        setSocket(io('http://localhost:5001'));

        // Cleanup function to run on component unmount
        return () => {
            // Set isMounted to false when the component is unmounted
            isMounted.current = false;

            // Log out the user or perform any cleanup actions
            logoutUser();
        };
    }, []);

    // Logout function
    const logoutUser = () => {
        // const loggedInUser = JSON.parse(localStorage.getItem('user:detail'));
        // const loggedInUserToken = JSON.parse(localStorage.getItem('user:token'));
        //
        // // Perform the logout action (clear user data, redirect, etc.)
        // console.log(`User ${loggedInUser.fullName} is logging out.`);

        // Optional: Clear user data from localStorage or perform any other cleanup
        localStorage.clear()
    };

    // Add event listener for beforeunload
    useEffect(() => {
        const handleUnload = () => {
            if (isMounted.current) {
                logoutUser();
            }
        };

        window.addEventListener('beforeunload', handleUnload);

        // Cleanup function to remove the event listener
        return () => {
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, []);


    useEffect(() => {
        setSocket(io('http://localhost:5001'))
    }, [])

    useEffect(() => {
        socket?.emit('addUser', user?.id);
        socket?.on('getUsers', (users) => {
            console.log('activeUsers :>> ', users);
            setActiveUsers(users)
        })
        socket?.on('getMessage', data => {
            setMessages(prev => ({
                ...prev,
                messages: [...prev.messages, {user: data.user, message: data.message}]
            }))
        })
    }, [socket])
    //
    //mod by smart
    useEffect(() => {
        // Mettez à jour contactsExist en fonction de votre logique
        const conversationExists = users.some(userObj =>
            !conversations.some(converObj => userObj.user.receiverId === converObj.user.receiverId)
        );

        setContactsExist(conversationExists);
    }, [users, conversations])
    //mod by smart

    useEffect(() => {
        messageRef?.current?.scrollIntoView({behavior: 'smooth'})
    }, [messages?.messages])

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user:detail'))
        const fetchConversations = async () => {
            const res = await fetch(`http://localhost:8000/api/conversations/${loggedInUser?.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const resData = await res.json()
            setConversations(resData)

        }
        fetchConversations()
    }, [])

    useEffect(() => {
        const fetchUsers = async () => {
            const res = await fetch(`http://localhost:8000/api/users/${user?.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const resData = await res.json()
            setUsers(resData)
        }
        fetchUsers()
    }, [])

    const fetchMessages = async (conversationId, receiver) => {
        // verifier si conversation.user.receiverId == receiver
       // const a = conversations.map((entry)=>entry.user.receiverid === receiver)
       //  console.log("a",a)
        const res = await fetch(`http://localhost:8000/api/message/${conversationId}?senderId=${user?.id}&&receiverId=${receiver?.receiverId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const resData = await res.json()
        setMessages({messages: resData, receiver, conversationId})
    }

    const sendMessage = async (e) => {
        setMessage('')
        socket?.emit('sendMessage', {
            senderId: user?.id,
            receiverId: messages?.receiver?.receiverId,
            message,
            conversationId: messages?.conversationId
        });
        const res = await fetch(`http://localhost:8000/api/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversationId: messages?.conversationId,
                senderId: user?.id,
                message,
                receiverId: messages?.receiver?.receiverId
            })
        });
    }


    // const sendMessage = async (e) => {
    //     setMessage('');
    //
    //     // Créez un objet FormData pour envoyer les données du formulaire, y compris l'image
    //     const formData = new FormData();
    //     formData.append('conversationId', messages?.conversationId);
    //     formData.append('senderId', user?.id);
    //     formData.append('message', message);
    //     formData.append('receiverId', messages?.receiver?.receiverId);
    //
    //     // Si une image est sélectionnée, ajoutez-la à FormData
    //     if (selectedImage) {
    //         formData.append('image', selectedImage);
    //     }
    //
    //     // Utilisez fetch pour envoyer les données au serveur
    //     const res = await fetch(`http://localhost:8000/api/message`, {
    //         method: 'POST',
    //         body: formData,
    //     });
    //
    //     // ...
    //
    //     // Émettez le message via le socket
    //     socket?.emit('sendMessage', {
    //         senderId: user?.id,
    //         receiverId: messages?.receiver?.receiverId,
    //         message,
    //         conversationId: messages?.conversationId
    //     });
    // };


    const filteredUsers = users.filter(userObj =>
        !conversations.some(converObj => userObj.user.receiverId === converObj.user.receiverId)
    );
    console.log("userObj.user.receiverId", conversations)
    // console.log("conve exist", contactsExist(filteredUsers))

    const ImageUploader = () => {

        // const [selectedImage, setSelectedImage] = useState(null);

        const onDrop = (acceptedFiles) => {
            // Mettez à jour l'état avec le fichier d'image sélectionné
            setSelectedImage(acceptedFiles[0]);
        };

        const {getRootProps, getInputProps} = useDropzone({onDrop});

        return (
            <div>
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <p>Glissez et déposez une image ici ou cliquez pour sélectionner</p>
                </div>
                {selectedImage && (
                    <div>
                        <p>Nom du fichier : {selectedImage.name}</p>
                        <p>Type : {selectedImage.type}</p>
                    </div>
                )}
            </div>
        );
    };
    // const isUserOnline = (conv) => conv.map((entry) => activeUsers.some((user) => user.receiverId === entry.user.receiverId));
    //
    // console.log("activeUsers:", activeUsers);
    // console.log("user ID:", user?.id);
    // const onlineStatus = isUserOnline(user?.id);
    // console.log("Is user online?", onlineStatus);
    // const isUserOnline_id = (conv) => conv.map((entry) => entry.user.receiverId);
    // console.log(conversations.map((entry) => entry.user.receiverId))
    const isUserOnline = (conv) => {
        return conv.map((entry) => {
            const isOnline = activeUsers.some((user) => user.userId === entry.user.receiverId);
            return isOnline
        });
    };
    const onlineStatus = isUserOnline(conversations, activeUsers);
    console.log(conversations);

    return (
        <div className='w-screen flex'>
            <div className='w-[25%] h-screen bg-secondary overflow-scroll no-scrollbar '>
                <div className='flex items-center  bg-gray-700 py-10'>
                    <div><img src={humain} width={75} height={75}
                              className='border border-primary p-[2px] rounded-full'/></div>
                    <div className='ml-8 text-white'>
                        <h3 className='text-2xl'>{user?.fullName}</h3>
                        <p className='text-lg font-light'>Mon Compte</p>
                    </div>
                </div>
                <hr/>
                <div className='mx-14 mt-10'>
                    <div className='text-primary text-2xl'>Messages</div>
                    <div>
                        {
                            conversations.length > 0 ?

                                conversations.map(({conversationId, user}) => {

                                    return (
                                        <div className='flex items-center py-8 border-b border-b-gray-300'>
                                            <div className='cursor-pointer flex items-center'
                                                 onClick={() => fetchMessages(conversationId, user)}>
                                                <div><img src={humain}
                                                          className="w-[50px] h-[50px] rounded-full p-[2px] border border-primary"/>
                                                </div>
                                                <div className='ml-6'>
                                                    <h3 className='text-lg font-semibold'>{user?.fullName}</h3>
                                                    {/*amod*/}
                                                    <p className='text-sm font-light text-gray-600'>{}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }) : <div className='text-center text-lg font-semibold mt-24'>Pas de Conversation</div>
                        }
                    </div>
                </div>
            </div>
            <div className='w-[50%] h-screen bg-white flex flex-col items-center'>
                {

                    messages?.receiver?.fullName &&
                    <div className='w-[75%] bg-secondary h-[80px] my-14 rounded-full flex items-center px-14 py-2'>
                        <div className='cursor-pointer'><img src={humain} width={60} height={60}
                                                             className="rounded-full"/></div>
                        <div className='ml-6 mr-auto'>
                            <h3 className='text-lg'>{messages?.receiver?.fullName}</h3>
                            <p className='text-sm font-light text-gray-600'>{messages?.receiver?.email}</p>
                        </div>
                        <div className='cursor-pointer'>
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-phone-outgoing"
                                 width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="green"
                                 fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path
                                    d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2"/>
                                <line x1="15" y1="9" x2="20" y2="4"/>
                                <polyline points="16 4 20 4 20 8"/>
                            </svg>
                        </div>
                    </div>
                }
                <div className='h-[75%] w-full overflow-scroll no-scrollbar shadow-sm'>
                    <div className='p-14'>
                        {
                            messages?.messages?.length > 0 ?
                                messages.messages.map(({message, user: {id} = {}}) => {
                                    return (
                                        <>
                                            <div
                                                className={`max-w-[40%] rounded-b-xl p-4 mb-6 ${id === user?.id ? 'bg-primary text-white rounded-tl-xl ml-auto' : 'bg-secondary rounded-tr-xl'} `}>{message}</div>
                                            <div ref={messageRef}></div>
                                        </>
                                    )
                                }) :
                                <div>
                                    <img src={new_message} alt=""/>
                                    <div className='text-center text-lg  font-semibold text-gray-300 mt-15'> Pas de
                                        Messages
                                        ou
                                        de Conversation Selectionée
                                    </div>
                                </div>

                        }
                    </div>
                </div>
                {
                    messages?.receiver?.fullName &&
                    <div className='p-14 w-full flex items-center'>
                        <Input placeholder='Ecrivez votre message...' value={message}
                               onChange={(e) => setMessage(e.target.value)}
                            //envoie avec la touche ENTRE
                               onKeyPress={(e) => {
                                   if (e.key === 'Enter' && !e.shiftKey) {
                                       sendMessage();
                                   }
                               }}
                               className='w-[75%]'
                               inputClassName='p-4 border-0 shadow-md rounded-full bg-light focus:ring-0 focus:border-0 outline-none'/>
                        <div
                            className={`ml-4 p-2 cursor-pointer bg-primary rounded-full ${!message && 'pointer-events-none'}`}
                            onClick={() => sendMessage()}>
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-send" width="30"
                                 height="30" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" fill="none"
                                 stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                                <path
                                    d="M21 3l-6.5 18a0.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a0.55 .55 0 0 1 0 -1l18 -6.5"/>
                            </svg>

                        </div>
                        <div
                            className={`ml-4 p-2 cursor-pointer bg-light rounded-full ${!message && 'pointer-events-none'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-circle-plus"
                                 width="30" height="30" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50"
                                 fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <circle cx="12" cy="12" r="9"/>
                                <line x1="9" y1="12" x2="15" y2="12"/>
                                <line x1="12" y1="9" x2="12" y2="15"/>
                            </svg>
                        </div>

                    </div>
                }
            </div>
            <div className='w-[25%] h-screen bg-light  overflow-scroll no-scrollbar'>
                <div className='flex justify-center bg-gray-700 py-8'>
                    <div className='text-primary text-2xl text-white'>Nouveau Contacts</div>
                </div>
                {
                    <div>
                        {contactsExist ? (
                            filteredUsers.map(({userId, user}) => (
                                <div key={userId} className='flex items-center py-8 border-b border-b-gray-300'>
                                    <div className='cursor-pointer flex items-center'
                                         onClick={() => fetchMessages('new', user)}>
                                        <div>
                                            <img src={humain} width={50} height={50}
                                                 className="rounded-full p-[2px] border border-primary"/>
                                        </div>
                                        <div className='ml-6'>
                                            <h3 className='text-lg font-semibold'>{user?.fullName}</h3>
                                            <p className='text-sm font-light text-gray-600'>{user?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className='text-center text-lg font-semibold mt-24'>Pas de Nouveau Contact</div>
                        )}
                    </div>
                }

            </div>
        </div>
    )
}

export default Dashboard