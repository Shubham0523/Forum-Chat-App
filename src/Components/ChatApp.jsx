import React, { useEffect, useState } from "react";
import './ChatApp.css'
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup, signOut, } from "firebase/auth";
import { app } from "../firebase";
import { getFirestore, addDoc, collection, serverTimestamp, onSnapshot, } from "firebase/firestore";
import { getDoc, doc } from "firebase/firestore";


const auth = getAuth(app);

// for database
const db = getFirestore(app);

// for database
const loginHandle = () => {
  const provider = new GoogleAuthProvider();

  signInWithPopup(auth, provider);
};
const logoutUser = () => {
  signOut(auth);
};
const ChatApp = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messageP, setMessageP] = useState([]);
  const [reply, setReply] = useState("");
  const [openReplyFormId, setOpenReplyFormId] = useState(null);

  const submitHandler = async (e) => {
    e.preventDefault();
    // Check If Message Is Empty 
    if (message.trim() === '') {
      // Display an error message or take appropriate action
      alert('Empty Message')
      console.error("Empty messages are not allowed");
      return;
    }
    try {
      // Check if user is not null and has uid before accessing uid
      if (user && user.uid) {
        await addDoc(collection(db, "Messages"), {
          text: message,
          uid: user.uid,
          uri: user.photoURL || "", // Use an empty string if photoURL is null
          createdAT: serverTimestamp(),
        });
      } else {
        console.error("User or user.uid is null");
      }

      setMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  const submitReply = async (parentId) => {
    if (reply.trim() === '') {
      alert('Empty Reply');
      console.error("Empty replies are not allowed");
      return;
    }

    try {
      if (user && user.uid) {
        await addDoc(collection(db, "Replies"), {
          text: reply,
          uid: user.uid,
          parentId: parentId,
          uri: user.photoURL || "",
          createdAT: serverTimestamp(),
        });
      } else {
        console.error("User or user.uid is null");
      }

      setReply("");
      setOpenReplyFormId(null); // Close the reply form after submitting
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (data) => {
      setUser(data);
    });
  
    onSnapshot(collection(db, "Messages"), async (snap) => {
      setMessageP(
        await Promise.all(
          snap.docs.map(async (item) => {
            const id = item.id;
            const data = item.data();
  
            // Fetch user information based on uid
            const userDoc = await getDoc(doc(db, "Users", data.uid));
            const userData = userDoc.data();
            console.log("User UID:", data.uid);
            console.log("User Data:", userData);
  
            return {
              id,
              displayName: userData?.displayName || "Unknown User",
              ...data,
            };
          })
        )
      );
    });
  
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="chat-container bg-gray-900">
      <div className="animate-slidein">
        <div className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white text-center">
          AI Regulation
        </div>
        <p className="text-center animate-slidein mb-6 text-lg font-normal text-gray-500 lg:text-2xl dark:text-gray-400">
          Will This Kill The AI Progress Or Save Humanity
        </p>
        <div className="flex justify-center items-center pt-12">
          <img src=
            "https://static01.nyt.com/images/2023/05/16/multimedia/16ALTMAN-sub-bzfh/16ALTMAN-sub-bzfh-videoSixteenByNine1050-v2.jpg"
            alt="gfg" />
        </div>
      </div>
      <button className="logout-btn" onClick={logoutUser}>Logout</button>
      <section className="bg-white dark:bg-gray-900 py-8 lg:py-16 antialiased">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">Discussion ({messageP.length})</h2>
          </div>
          <form className="mb-6" onSubmit={submitHandler}>
            <div className="py-2 px-4 mb-4 bg-white rounded-lg rounded-t-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <label htmlFor="comment" className="sr-only">Your comment</label>
              <textarea id="comment" rows="6"
                className="px-0 w-full text-sm text-gray-900 border-0 focus:ring-0 focus:outline-none dark:text-white dark:placeholder-gray-400 dark:bg-gray-800"
                placeholder="Write a comment..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                type="text"
                required>
              </textarea>
            </div>
            {user ? (
              <button type="submit"
                className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-primary-700 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800">
                Comment as {user.displayName}
              </button>
            ) : (
              <button onClick={loginHandle}>Sign in with Google</button>
            )}
          </form>
          {messageP.map((item) => (
            <div key={item.id}>
              {user && (
                <>
                  <article className="p-6 text-base bg-white rounded-lg dark:bg-gray-900">
                    <footer className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <p className="inline-flex items-center mr-3 text-sm text-gray-900 dark:text-white font-semibold"><img
                          className="mr-2 w-6 h-6 rounded-full"
                          src={item.uri}
                          alt={item.displayName} />{item.displayName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400"><time pubdate="true" dateTime={item.createdAT.toDate().toISOString()} title={item.createdAT.toDate().toLocaleString()}>{item.createdAT.toDate().toLocaleString()}</time></p>
                      </div>
                    </footer>
                    <p className="text-gray-500 dark:text-gray-400">{item.text}</p>
                    <div className="flex items-center mt-4 space-x-4">
                      <button type="button"
                        className="flex items-center text-sm text-gray-500 
                        hover:underline dark:text-gray-400 font-medium"
                        onClick={() => setOpenReplyFormId(item.id)}
                      >
                        <svg className="mr-1.5 w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 18">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5h5M5 8h2m6-3h2m-5 3h6m2-7H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3v5l5-5h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Z" />
                        </svg>
                        Reply
                      </button>
                    </div>
                    {/* Reply Form */}
                    {openReplyFormId === item.id && (
                      <form className="mb-6 ml-8" onSubmit={(e) => { e.preventDefault(); submitReply(item.id); }}>
                        <div className="py-2 px-4 mb-4 bg-white rounded-lg rounded-t-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                          <label htmlFor={`reply-${item.id}`} className="sr-only">Your reply</label>
                          <textarea
                            id={`reply-${item.id}`}
                            rows="4"
                            className="px-0 w-full text-sm text-gray-900 border-0 focus:ring-0 focus:outline-none dark:text-white dark:placeholder-gray-400 dark:bg-gray-800"
                            placeholder="Write a reply..."
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            type="text"
                            required
                          ></textarea>
                        </div>
                        <button type="submit" className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-primary-700 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800">
                          Reply
                        </button>
                      </form>
                    )}
                    {/* Display Replies */}
                    <div className="mt-4 space-y-2">
                      {messageP
                        .filter((replyItem) => replyItem.parentId === item.id)
                        .map((replyItem) => (
                          <div key={replyItem.id} className="p-4 bg-gray-100 rounded-md dark:bg-gray-800">
                            <p className="text-gray-500 dark:text-gray-400">{replyItem.text}</p>
                            <div className="flex items-center mt-2 space-x-2">
                              <img
                                className="w-6 h-6 rounded-full"
                                src={replyItem.uri}
                                alt={replyItem.displayName}
                              />
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <time
                                  dateTime={replyItem.createdAT.toDate().toISOString()}
                                  title={replyItem.createdAT.toDate().toLocaleString()}
                                >
                                  {replyItem.createdAT.toDate().toLocaleString()}
                                </time>
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </article>
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ChatApp;
