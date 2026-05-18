import { useState, useEffect } from "react";
import { card, cardTitle, dot, actionBtn } from "../styles/theme";
import { useTheme } from "../context/ThemeContext";

const API = "http://127.0.0.1:8000";

export default function GuardianSOS() {

  const t = useTheme();

  const [guardians, setGuardians] = useState([]);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    fetchGuardians();
  }, []);

  const fetchGuardians = async () => {

    try {

      const token = localStorage.getItem(
        "token"
      );

      const res = await fetch(

        `${API}/guardians`,

        {
          headers: {
            Authorization:
            `Bearer ${token}`
          }
        }

      );

      const data = await res.json();

      setGuardians(
        Array.isArray(data)
        ? data
        : []
      );

    }

    catch {

      setError(
        "Could not load guardians."
      );

    }

  };


  const addGuardian = async () => {

    if (

      !newName.trim()

      ||

      !newPhone.trim()

    ) {

      setError(
        "Enter name and phone."
      );

      return;

    }

    setLoading(true);

    setError("");

    try {

      const token = localStorage.getItem(
        "token"
      );

      await fetch(

        `${API}/guardians/add`,

        {

          method: "POST",

          headers: {

            "Content-Type":
            "application/json",

            Authorization:
            `Bearer ${token}`

          },

          body: JSON.stringify({

            name: newName,

            phone: newPhone

          })

        }

      );

      setNewName("");

      setNewPhone("");

      fetchGuardians();

    }

    catch {

      setError(
        "Failed to add guardian."
      );

    }

    finally {

      setLoading(false);

    }

  };


  const removeGuardian = async (id) => {

    await fetch(

      `${API}/guardians/${id}`,

      {
        method:"DELETE"
      }

    );

    fetchGuardians();

  };


  const saveEdit = async(id)=>{

    setGuardians(

      prev=>

      prev.map(

        g=>

        g.id===id

        ?

        {

          ...g,

          name:editName,

          phone:editPhone

        }

        :

        g

      )

    );

    setEditingId(null);

  };


  const triggerSOS = async()=>{

    try{

      await fetch(

        `${API}/sos/trigger`,

        {

          method:"POST",

          headers:{

            "Content-Type":

            "application/json"

          },

          body:JSON.stringify({

            user_id:

            localStorage.getItem(
              "email"
            )

          })

        }

      );

      alert(
        "🚨 SOS Triggered"
      );

    }

    catch{

      alert(
        "Failed"
      );

    }

  };


  const inputStyle={

    flex:1,

    padding:"10px 12px",

    borderRadius:8,

    background:t.input,

    color:t.text,

    border:

    `1px solid ${t.green}`,

    outline:"none"

  };


  const actionGhost=(color)=>({

    padding:"8px 12px",

    borderRadius:8,

    border:

    `1px solid ${color}`,

    background:

    `${color}15`,

    color,

    cursor:"pointer",

    fontWeight:700,

    fontSize:11

  });


  return(

    <div style={{

      display:"flex",

      flexDirection:"column",

      gap:20

    }}>

      <div style={card(t)}>

        <div style={cardTitle(t)}>

          <span style={dot(t.purple)} />

          TRUSTED CIRCLE

        </div>


        <div style={{

          marginTop:18,

          display:"flex",

          flexDirection:"column",

          gap:12

        }}>

          {

            guardians.length===0 &&

            <div style={{

              textAlign:"center",

              color:t.textDim

            }}>

              No guardians added yet

            </div>

          }


          {

            guardians.map(

              g=>(

              <div

                key={g.id}

                style={{

                  display:"flex",

                  alignItems:"center",

                  gap:14,

                  padding:14,

                  borderRadius:10,

                  background:

                  `${t.purple}10`,

                  border:

                  `1px solid ${t.purple}35`

                }}

              >

                <div style={{

                  width:42,

                  height:42,

                  borderRadius:"50%",

                  background:

                  `${t.purple}25`,

                  display:"flex",

                  alignItems:"center",

                  justifyContent:"center",

                  color:t.purple,

                  fontWeight:700

                }}>

                  {

                    g.name[0]

                    ?.toUpperCase()

                  }

                </div>


                <div style={{flex:1}}>

                  {

                    editingId===g.id

                    ?

                    <>

                      <input

                        value={editName}

                        onChange={e=>

                          setEditName(

                            e.target.value

                          )

                        }

                        style={{

                          ...inputStyle,

                          marginBottom:6,

                          width:"100%"

                        }}

                      />

                      <input

                        value={editPhone}

                        onChange={e=>

                          setEditPhone(

                            e.target.value

                          )

                        }

                        style={{

                          ...inputStyle,

                          width:"100%"

                        }}

                      />

                    </>

                    :

                    <>

                      <div style={{

                        fontWeight:700

                      }}>

                        {g.name}

                      </div>

                      <div style={{

                        color:t.textDim,

                        fontSize:11

                      }}>

                        {g.phone}

                      </div>

                    </>

                  }

                </div>


                <div style={{

                  display:"flex",

                  gap:8

                }}>

                  {

                    editingId===g.id

                    ?

                    <>

                      <button

                        style={

                          actionGhost(

                            t.green

                          )

                        }

                        onClick={()=>

                          saveEdit(g.id)

                        }

                      >

                        SAVE

                      </button>

                      <button

                        style={

                          actionGhost(

                            t.red

                          )

                        }

                        onClick={()=>

                          setEditingId(

                            null

                          )

                        }

                      >

                        CANCEL

                      </button>

                    </>

                    :

                    <>

                      <button

                        style={

                          actionGhost(

                            t.purple

                          )

                        }

                        onClick={()=>{

                          setEditingId(
                            g.id
                          );

                          setEditName(
                            g.name
                          );

                          setEditPhone(
                            g.phone
                          );

                        }}

                      >

                        EDIT

                      </button>

                      <button

                        style={

                          actionGhost(
                            t.red
                          )

                        }

                        onClick={()=>

                          removeGuardian(
                            g.id
                          )

                        }

                      >

                        DELETE

                      </button>

                    </>

                  }

                </div>

              </div>

            ))

          }


          <div style={{

            display:"flex",

            gap:8

          }}>

            <input

              placeholder="Name"

              value={newName}

              onChange={e=>

                setNewName(
                  e.target.value
                )

              }

              style={inputStyle}

            />

            <input

              placeholder="Phone"

              value={newPhone}

              onChange={e=>

                setNewPhone(
                  e.target.value
                )

              }

              style={inputStyle}

            />

          </div>


          {

            error &&

            <div style={{

              color:t.red

            }}>

              {error}

            </div>

          }


          <button

            onClick={addGuardian}

            disabled={loading}

            style={

              actionBtn(
                t.purple
              )

            }

          >

            {

              loading

              ?

              "Adding..."

              :

              "⊕ Add Guardian"

            }

          </button>


          <button

            onClick={triggerSOS}

            style={

              actionBtn(
                t.red
              )

            }

          >

            🚨 Trigger SOS Now

          </button>

        </div>

      </div>

    </div>

  );

}