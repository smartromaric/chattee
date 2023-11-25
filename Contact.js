import React, {useState, useEffect} from 'react';
import humain from "./client/src/assets/humain.png";

// ...

function Contact() {
    const [contactsExist, setContactsExist] = useState(true);

    useEffect(() => {
        // Mettez à jour contactsExist en fonction de votre logique
        const conversationExists = users.some(userObj =>
            conversations.some(converObj => userObj.user.receiverId === converObj.user.receiverId)
        );

        setContactsExist(!conversationExists);
    }, [users, conversations]);
    console.log('users:', users); // Add this line for debugging
    console.log('conversations:', conversations); // Add this line for debugging

    return (
        <div>
            {contactsExist ? (
                users.map(({userId, user}) => (

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
                <p>Aucun contact</p>
            )}
        </div>
    );
}

export default Contact;
