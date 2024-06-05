"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "../constants";



const ZoomCodeSection = () => {
  const [code, setCode] = useState("");
  const searchParams = useSearchParams();

  const search = searchParams.get("code");

  async function saveZoomCode(code: string) {
    try {
      const accessToken =  localStorage.getItem('access_token') // Please use refresh token to get new access token 
      const res = await fetch(`${API_URL}/zoom/authorize`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
        }),
      });

      if (!res.ok) {
        console.log(res);
        const err = await res.json();
        console.log(err);

        return;
      }

      const body: {
        is_zoom_authorized: boolean;
        url?: string | undefined;
      } = await res.json();

      if (body.is_zoom_authorized) {
        window.close();
      } else {
        console.log(body);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (search) {
      setCode(search);
      saveZoomCode(search);
    }
  }, [search]);

  useEffect(() => {
    if (window) {
      window.addEventListener("beforeunload", () => {
        window.opener.postMessage("childWindowClosed", window.location.origin);
      });
    }
  }, []);

  return (
    <div>
      <h3>Code :</h3>
      <p>{code}</p>
    </div>
  );
};

export default ZoomCodeSection;
