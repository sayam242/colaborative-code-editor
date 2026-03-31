import "./App.css"
import Editor from '@monaco-editor/react';
import{MonacoBinding} from "y-monaco"
import{useRef,useMemo,useState, useEffect} from "react"
import * as Y from "yjs"
import{SocketIOProvider} from "y-socket.io"

function App() {

  const editorRef=useRef(null)
  const[username,setUsername]=useState(()=>{
    return new URLSearchParams(window.location.search).get("username") || ""//after reload also it can extract info from the window 
  })
  const [users,setUsers]=useState([])




  const ydoc=useMemo(()=>new Y.Doc(),[])/** to memoize data of all files as object it is like a cache*/
  const ytext=useMemo(()=>ydoc.getText("monaco"),[ydoc])/**it is used to access data of any particular file as in this case it is monaco and if no file with this name exists then it returns empty string */

  const handleMount=(editor)=>{
    editorRef.current=editor

      new MonacoBinding(
      ytext,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      
    )
  }



  const handleJoin=(e)=>{
    e.preventDefault()
    setUsername(e.target.username.value)
    window.history.pushState({},"","?username=" +e.target.username.value)
    
  }


useEffect(()=>{
  console.log("username",username)
  if(username){
    const provider=new SocketIOProvider("http://localhost:3000","monaco",ydoc,{autoConnect:true,})/**this main line helps to connect yjs and monaco */
    
    provider.awareness.setLocalStateField("user",{username})
    const states=Array.from(provider.awareness.getStates().values())
    setUsers(states.filter(state=>state.user && state.user.username).map(state=>state.user))

    provider.awareness.on("change",()=>{
      const states=Array.from(provider.awareness.getStates().values())
      setUsers(states.filter(state=>state.user && state.user.username).map(state=>state.user))
    })

    function handleBeforeUnload(){
      provider.awareness.setLocalStateField("user",null) 
    }

    window.addEventListener("beforeunload",handleBeforeUnload)

   

    return()=>{
      provider.disconnect()
      window.removeEventListener("beforeunload",handleBeforeUnload)
  }
}
},[
  username
])


  if(!username){
    return(
      <main className="h-screen w-full bg-gray-950 flex gap-4 p-4 items-center justify-center">
        <form
        onSubmit={handleJoin}
        className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter yuur username"
            className="p-2 rounded-lg bg-gray-800 text-white"
            name="username"
            />
          <button className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold">
            Join
          </button>
        </form>
      </main>
    )
  }
  return (
    <main
    className="h-screen w-full bg-gray-950 flex gap-4 p-4"
    >
      <aside
      className="h-full w-1/4 bg-amber-50 rounded-lg "
      >
        <h2 className="text-2xl font-bold p-4 border-b border-gray-300">Users</h2>
        <ul className="p-4">
          {users.map((user, index) => (
            <li key={index} className="p-2 bg-gray-800 text-white rounded mb-2">
              {user.username}
            </li>
          ))}
        </ul>
      </aside>
      <section
        className="w-3/4 bg-neutral-800 rounded-lg overflow-hidden">
        <Editor
          height="100vh"
          defaultLanguage="javascript"
          defaultValue="// Write you code here"
          theme="vs-dark"
          onMount={handleMount}
      />
      </section>
    </main>
  )
}

export default App
