import axios from "axios";

const test = async () => {
  try {
    const res = await axios.delete("http://localhost:5000/api/message/69b85eb8dd0229b748b40a47");
    console.log("Response:", res.status);
  } catch (err) {
    if (err.response) {
      console.log("Error status:", err.response.status);
      console.log("Error data:", err.response.data);
    } else {
      console.log("Error:", err.message);
    }
  }
};

test();
