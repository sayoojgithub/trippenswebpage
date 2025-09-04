
import axios from "axios"
const PUBLICAPI = axios.create({
  baseURL: "http://localhost:5000/api/v1",
 withCredentials: false, 
});

export default PUBLICAPI;

