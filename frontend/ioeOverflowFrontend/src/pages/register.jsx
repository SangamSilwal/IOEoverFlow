import { useEffect, useState } from "react"
import axios from "axios"
import "./pagesStyles/register.css"

const RegisterPage = () => {
    const [name,setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [biostatus,setBioStatus] = useState('');
    const [departMent, setDepartment] = useState('');
    const [collegeName, setCollege] = useState('');
    const [profilePicUrl, setProfilePic] = useState(null);

    const [departments, setDepartments] = useState([]);
    const [colleges, setColleges] = useState([]);
    
    const [errorMessage, setErrorMessage] = useState('');
    useEffect(()=>{
        const fetchEnums = async () => {
            try {
                const departmentResponse = await axios.get('http://localhost:8000/api/v1/enums/departments');
                const collegeResponse = await axios.get('http://localhost:8000/api/v1/enums/colleges');
                const Departdata = departmentResponse.data.data.ioeBachelorProgramsValues
                const CollData = collegeResponse.data.data.ioeCollegeValues
                setDepartments(Departdata);
                setColleges(CollData);
            } catch (error) {
                console.log("Error while fetching Enum APi", error)
            }
        };
        fetchEnums();
    },[]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name',name);
        formData.append('username',username);
        formData.append('email',email);
        formData.append('password',password);
        formData.append('biostatus',biostatus);
        formData.append('collegeName',collegeName);
        formData.append('departMent',departMent);
        if(profilePicUrl)
        {
            formData.append('profilePicUrl',profilePicUrl)
        }
        try {
            const res = await axios.post('http://localhost:8000/api/v1/users/register',formData,{
                headers: {'Content-Type':'multipart/form-data','Accept': 'application/json'},
            });

            console.log("Registration Succesfull",res.data)
            

        } catch (error) {
            const match = error.response.data.match(/<pre>Error:\s*(.*?)<br>/);
            const message = match ? match[1] : 'An error occurred';
            setErrorMessage(message)
        }
    }


    return (
        <form onSubmit={handleSubmit} class="registration-form">
  <h1 class="form-title">Join Our University Community</h1>
  
  <div class="form-grid">
    
    <div class="form-group">
      <label class="form-label">Full Name</label>
      <input
        type="text"
        placeholder="Enter your full name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        class="form-input"
      />
    </div>
    
    
    <div class="form-group">
      <label class="form-label">Username</label>
      <input
        type="text"
        placeholder="Choose a username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
        class="form-input"
      />
    </div>
    
   
    <div class="form-group">
      <label class="form-label">Email</label>
      <input
        type="email"
        placeholder="your.email@university.edu"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        class="form-input"
      />
    </div>
    
    
    <div class="form-group">
      <label class="form-label">Password</label>
      <input
        type="password"
        placeholder="Create a strong password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        class="form-input"
      />
    </div>
    
    
    <div class="form-group">
      <label class="form-label">Department</label>
      <select
        value={departMent}
        onChange={e => setDepartment(e.target.value)}
        required
        class="form-input"
      >
        <option value="">Select Department</option>
        {departments.map((d, i) => (
          <option key={i} value={d}>{d}</option>
        ))}
      </select>
    </div>
    
    
    <div class="form-group">
      <label class="form-label">College</label>
      <select
        value={collegeName}
        onChange={e => setCollege(e.target.value)}
        required
        class="form-input"
      >
        <option value="">Select College</option>
        {colleges.map((c, i) => (
          <option key={i} value={c}>{c}</option>
        ))}
      </select>
    </div>
  </div>
  

  <div class="form-group-wide">
    <label class="form-label">Bio</label>
    <textarea
      placeholder="Tell us about yourself..."
      value={biostatus}
      onChange={e => setBioStatus(e.target.value)}
      class="form-textarea"
    ></textarea>
  </div>
  

  <div class="form-group-wide">
    <label class="form-label">Profile Picture</label>
    <div class="file-upload-container">
      <label class="file-upload-label">
        <svg class="file-upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <span class="file-upload-text">
          {profilePicUrl ? 'Change photo' : 'Upload a photo'}
        </span>
        <input
          type="file"
          accept="image/*"
          name="profilePic"
          onChange={(e) => setProfilePic(e.target.files)}
          class="file-upload-input"
        />
      </label>
    </div>
  </div>
  {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
 
  <button
    type="submit"
    class="submit-button"
  >
    Register Now
  </button>
  
  <p class="login-link">
    Already have an account? <a href="#" class="login-link-text">Sign in</a>
  </p>
</form>
      );
    };
    
    export default RegisterPage;