import React, { useEffect, useState } from "react";
import axios from "axios";

const VerifyPage = () => {
  const [data, setData] = useState(null);

  const query = new URLSearchParams(window.location.search);
  const hash = query.get("hash");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `https://verix-backend.onrender.com/api/verify-hash/${hash}`
        );
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (hash) fetchData();
  }, [hash]);

  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h2>🔍 Verification Result</h2>

      {!data && <p>Loading...</p>}

      {data && (
        <>
          <h3>Status: {data.status}</h3>
          <p>Result: {data.result}</p>
          <p>Hash: {data.hash}</p>
        </>
      )}
    </div>
  );
};

export default VerifyPage;