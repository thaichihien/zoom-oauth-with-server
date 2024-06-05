# OAuth 2.0 for Zoom

## Cách chạy chương trình

- Tại `src/app/constants.ts` thay thế bằng url server
- Tải package với `yarn hoặc npm i`
- Chạy với `yarn dev hoặc npm run dev`

## Hướng dẫn sử dụng

- Ở màn hình (route `/`) chính cần access token từ account đối tác nên nhập email và mật khẩu account đối tác
- Khi đăng nhập thành công nhấn nút **Request integrate Zoom** để gọi API lấy tài khoản Zoom. Sẽ có 2 TH:
- **Nếu đã xác thực zoom đầy đủ** : sẽ hiển thị thông tin tài khoản zoom. Server cũng đã ghi nhận kết nối Zoom , đối tác có thể tương tác các chức năng của Zoom
- Nếu đây là lần đầu tiên kết nối zoom hoặc thông tin xác thực zoom sai xót thì cần mở rộng xác thực tiếp như sau 

### Xác thực Zoom

- Gọi đến API với endpoint `/zoom/request` và nhận kết quả với thuộc tính `is_zoom_authorized`
- Nếu `is_zoom_authorized = false` thì luôn luôn có thuộc tính `url` kèm theo. Ứng dụng sẽ mở một window với đường dẫn đó để xác thực

```Typescript
if (!body.is_zoom_authorized) {
  const newWindow = window.open(
  body.url!,
  "_blank",
  "width=600,height=400,toolbar=no,location=no"
  );
}
```
- Tại cửa số vừa mới mở, đối tác sẽ thực hiện đăng nhập tài khoản Zoom và đồng ý để app `E Ticket` quyền để truy cập thông tin tài khoản, tạo zoom meeting,...
- Sau khi nhấn nút đồng ý thì trình duyệt ở cửa sổ sẽ redirect tới *redirect_uri được định nghĩa bởi app* ở đây sẽ là cùng host port với ứng dụng này nhưng path sẽ là `/zoom`
- Khi redirect tới đó nó sẽ kèm vào một search param là `code` ví dụ như sau : `/zoom?code=15sadsajkwqhisasadquu5q3a`
- Khi này ngay tại trang với path `/zoom`cần thực hiện lấy code :

```Typescript
const [code, setCode] = useState("");
const searchParams = useSearchParams();
const search = searchParams.get("code");
  useEffect(() => {
    if (search) {
      setCode(search);
      saveZoomCode(search);
    }
  }, [search]);
 
 // Dùng để cài đặt báo hiệu cho trình duyệt mẹ biết cửa sổ con đã đóng
useEffect(() => {
  if (window) {
    window.addEventListener("beforeunload", () => {
    window.opener.postMessage("childWindowClosed", window.location.origin);
    });
  }
}, []);
  
```

- Thực hiện gọi api để gửi code về cho server và đồng thời tắt cửa sổ để báo cho trình duyệt mẹ đã hoàn thành xác thực zalo và gọi lấy tài khoản:

```Typescript
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
  window.close();  // đóng cửa sổ
} else {
  console.log(body);
}
```

- Ở trình duyệt nhận tín hiệu và lúc này đối tác đã kết với và có khả năng sử dụng Zoom

```Typescript
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
```

## LƯU Ý

- *redirect_uri được định nghĩa bởi app* cần bên FE cung cấp host mong muốn nếu có deploy. Mặc định hiện tại : `http://localhost:3000/zoom`
- Vì app Zoom hiện tại dùng cho development, test,... nên tài khoản kết nối, tạo Zoom chỉ có thể dùng duy nhất 1 account -> liên hệ Hiện để cung cấp
- Ngoài ra đọc thêm hướng dẫn API liên quan



