import React from 'react'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { toast } from 'react-toastify'
import Spinner from '../Component/Spinner'


const RegisterPage = () => {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [author, setAuthor] = useState(false) 

  const {user, register, error, isLoading } = useAuthStore()
  
  // const {userInfo} = useSelector(state => state.auth)
  // const [register] = useRegisterMutation()
  // const dispatch = useDispatch()
  const navigate = useNavigate()

  
  
  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [navigate, user])

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (isLoading) {
    return <Spinner/>
  }

  const canSave = Boolean(name) && Boolean(username) && Boolean(password) && Boolean(confirmPassword)

  // const handleRegister = async(e) => {
  //   e.preventDefault()
  //   let role = ''
  //   if(password !== confirmPassword){
  //     toast.error("password doesn't match ")
  //     return 
  //   }
  //   try {
  //     if (author === true) {
  //       role = 'author'
  //       await register(name, username, password, role)
  //       return navigate('/login')
  //     }
  //     await register(name, username, password)
  //     navigate('/login')
  //   } catch (error) {
  //     toast(error?.response?.data)
  //   }
  // }

  // const handleRegister = async (e) => {
  //   e.preventDefault()
  //   let role = ''
  //   if (author) {
  //     role = 'author'
  //     const res = await register({name, username, role, password}).unwrap()
  //     dispatch(setCredentials({...res}))
  //     navigate('/')
  //   } else {
  //     const res = await register({name, username, password}).unwrap()
  //     dispatch(setCredentials({...res}))
  //     navigate('/')
  //   }
  // }

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    const role = author ? "author" : "user";

    try {
      await register(name, username, password, role);

      // Only navigate if no error was set in the store
      if (!error) {
        navigate("/login");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    }
  };
  return (
    <div>
      <form className='rounded-md ring-1 p-4 mx-auto w-96 m-5' onSubmit={handleRegister}>
        <h2 className='text-center text-bold text-3xl py-2.5'>Register</h2>
      <div>
      <label className="input validator">
          <svg
           className="h-[1em] opacity-50" 
           xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g strokeLinejoin="round" strokeLinecap="round"  strokeWidth="2.5" fill="none" stroke="currentColor">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2">
                </path><circle cx="12" cy="7" r="4">
                  </ circle></g>
          </svg>
          <input 
          type="input" 
          required 
          placeholder="Name" 
          pattern="[A-Za-z][A-Za-z0-9\-]*" 
          minLength="3"
          maxLength="30" 
          title="Only letters or numbers"
          value={name}
          onChange={(e) => setName(e.target.value)} 
          />
      </label>
    <p className="validator-hint">
     Must be 3 to 30 characters
      <br/>containing only letters or numbers
      </p>
      </div>
      <div>
      <label className="input validator">
          <svg
           className="h-[1em] opacity-50" 
           xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g strokeLinejoin="round" strokeLinecap="round"  strokeWidth="2.5" fill="none" stroke="currentColor">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2">
                </path><circle cx="12" cy="7" r="4">
                  </ circle></g>
          </svg>
          <input 
          type="input" 
          required placeholder="Username" 
          pattern="[A-Za-z][A-Za-z0-9\-]*"
          minLength="3" 
          maxLength="30" 
          title="Only letters or numbers"
          value={username}
          onChange={(e) => setUsername(e.target.value)}   
          />
      </label>
    <p className="validator-hint">
     Must be 3 to 30 characters
      <br/>containing only letters or numbers
      </p>
      </div>
      <div>
        <label className="input validator">
  <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle></g></svg>
  <input type="password"
   required placeholder="Password" 
   minLength="8" 
   pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" 
   title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
   value={password}
   onChange={(e) => setPassword(e.target.value)} 
   />
        </label>
        <p className="validator-hint hidden">
  Must be more than 8 characters, including
  <br/>At least one number
  <br/>At least one lowercase letter
  <br/>At least one uppercase letter
        </p>
      </div>
      <div className='mt-10'>
        <label className="input validator">
  <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle></g></svg>
  <input type="password"
   required placeholder=" Confirm Password" 
   minLength="8" 
   pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" 
   title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
   value={confirmPassword}
   onChange={(e) => setConfirmPassword(e.target.value)} 
   />
        </label>
        <p className="validator-hint hidden">
  Must be more than 8 characters, including
  <br/>At least one number
  <br/>At least one lowercase letter
  <br/>At least one uppercase letter
        </p>
      </div>
      <div className='my-3'>
      <input type="checkbox" value={author} onChange={(e) => setAuthor(e.target.checked)} className="checkbox" /> Author
      </div>
      <button disabled={!canSave} className="flex btn bg-blue-500 text-amber-100  btn-wide items-center mt-2 mx-auto">Register</button>
      {error && <p className='text-red-500 font-semibold mt-2'>{error}</p>}
      <p className="text-center mt-2">Already have an account? <Link to="/login" className="text-blue-500">Login</Link></p>
      </form>
    </div>
  )
}

export default RegisterPage