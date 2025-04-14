<script>
  import "../app.scss";
  import { auth } from "../firebaseConfig.js";
  import { signInWithEmailAndPassword } from "firebase/auth";
  import Input from "../components/Input/+input.svelte";
  import Button from "../components/Button/+button.svelte";
  import Checkbox from "../components/Checkbox/+checkbox.svelte";
  import rocketImage from "../assets/images/login-rocket.png";
  let email = '';
  let password = '';
  let message = '';
  let userEmail = '';
  let userUid = '';

  const GRAPHQL_ENDPOINT = "http://127.0.0.1:5001/kronos-902fe/us-central1/api/graphql";
  
  const login = async () => {
        message ='';
        userEmail = '';
        userUid = '';
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const token = await userCredential.user.getIdToken(); 
          message = `Hoşgeldiniz ${userCredential.user.email}`;
          localStorage.setItem('authToken', token);

          const query = `
            query GetUserData($uid: String!) {
              user(uid: $uid) {
                uid
                email
              }
            }
          `;

          const response = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              query,
              variables: {
                uid: userCredential.user.uid,
              },
            }),
          });

          const result = await response.json();

          if (result.errors) {
            message = 'Hata oluştu: ' + result.errors[0].message;
            userEmail = '';
            userUid = '';
          } else {
            const userData = result?.data?.user;
            userEmail = userData.email;
            userUid = userData.uid;
          }
        } catch (error) {
            message = 'Giriş başarısız ';
        }
    };
</script>

<slot />

<div
  class="flex flex-row items-start justify-between item h-screen border border-cyan-950 py-20 px-28 gap-32 bg-gradient-to-r from-linear1 to-linear2"
>
  <div class="flex gap-16 flex-col">
    <div class="flex flex-col gap-5">
      <h1 class="text-7xl text-space-purple">KRONOS</h1>
      <span class="text-3xl text-ocean-blue">WELCOME</span>
    </div>
    <form class="flex flex-col gap-4">
      <Input
        customClass="w-100 rounded-md"
        placeholder="@atmosware.turkcell.com.tr"
        label="USERNAME/E-MAIL"
        value={email}
        onInput={(value) => email = value}
      />
      <Input 
        placeholder="password" 
        label="PASSWORD" 
        value={password}  
        onInput={(value) => password = value}
      />
      <Checkbox label="Beni Hatırla" />
      <Button
        onClick={login} 
        buttonText="Giriş Yap"
        className=" bg-gradient-to-r from-pacific-gradient-1 to-pacific-gradient-2 rounded-md p-3 text-white"
      />
      {message}
      {#if message && userEmail && userUid}
        <div>
          <p>Kullanıcı: {userEmail}</p>
          <p>UID: {userUid}</p>
        </div>
      {/if}
    </form>
  </div>
  <img src={rocketImage} alt="rocket" />
</div>
