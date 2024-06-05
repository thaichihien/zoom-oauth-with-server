"use client";

import { useEffect, useState } from "react";

interface ApiResponse {
  message: string;
}

const FetchButton: React.FC<{ accessToken: string }> = ({ accessToken }) => {
  const [showCreateMeetingBtn, setShowCreateMeetingBtn] = useState(false);
  const [zoomInfo, setZoomInfo] = useState<{
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    pmi: number;
    display_name: string;
    pic_url: string;
    status: string;
  } | null>(null);

  async function checkZoomAuthorize() {
    const res = await fetch("http://localhost:4000/zoom/request", {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
      cache: "no-cache",
    });

    if (!res.ok) {
      console.log(res);
      return;
    }

    const body: {
      is_zoom_authorized: boolean;
      url?: string | undefined;
      user?: any;
    } = await res.json();

    if (body.is_zoom_authorized) {
      setZoomInfo(body.user);
      setShowCreateMeetingBtn(true);
    }
  }

  const handleClick = async () => {
    try {
      const res = await fetch("http://localhost:4000/zoom/request", {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      });

      if (!res.ok) {
        console.log(res);
        return;
      }

      const body: {
        is_zoom_authorized: boolean;
        url?: string | undefined;
        user? : any
      } = await res.json();

      if (!body.is_zoom_authorized) {
        const newWindow = window.open(
          body.url!,
          "_blank",
          "width=600,height=400,toolbar=no,location=no"
        );
      } else {
        setShowCreateMeetingBtn(true);
        setZoomInfo(body.user);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleMessage = (event: any) => {
      if (event.origin === window.location.origin) {
        if (event.data === "childWindowClosed") {
          console.log("The child window has been closed.");
          checkZoomAuthorize();
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div className="flex flex-col items-center mt-10">
      {zoomInfo ? (
        <div>
          <h2 className=" text-lg font-bold">Connect Zoom account successfully: </h2>
          <ul>
            <li>First name : {zoomInfo.first_name}</li>
          
            <li>Email : {zoomInfo.email}</li>
            <li>
              Avatar : <img className=" w-28" src={zoomInfo.pic_url}></img>
            </li>
          </ul>
        </div>
      ) : (
        <button
          className=" bg-green-600 w-fit p-3 rounded-md"
          onClick={handleClick}
        >
          Request integrate Zoom
        </button>
      )}

      {showCreateMeetingBtn && (
        <button className="mt-10 bg-blue-500 p-3 rounded-lg "
        type="button"
          onClick={e => {
            e.preventDefault()
            alert('call /event-session/{eventSessionId}/zoom to create zoom meeting for event session')
          }}
        >
          Create meeting
        </button>
      )}
    </div>
  );
};

export default FetchButton;
