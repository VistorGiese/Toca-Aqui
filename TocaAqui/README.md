# Toca Aqui (App Mobile)

App mobile construído com [Expo](https://expo.dev), React Native e React Navigation (sem Expo Router).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure environment

   Copie o arquivo de exemplo e ajuste a URL da API:

   ```bash
   cp .env.example .env.development.local
   ```

   Em seguida, defina `EXPO_PUBLIC_API_URL` no arquivo `.env.development.local`:

   ```bash
   EXPO_PUBLIC_API_URL=http://SEU_IP_DA_REDE:3000
   ```

3. Start the app

   ```bash
   npx expo start -c --lan
   ```

In the output, you'll find options to open the app in a:

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go)

O entrypoint do app é `index.js`, que registra `App.tsx`.
O componente principal está em `app/app.tsx` e a navegação em `navigation/Navigate.tsx`.

## Network checks (Expo Go + backend local)

- O celular deve estar na mesma rede Wi-Fi do computador.
- O backend deve estar acessível via `http://SEU_IP_DA_REDE:3000`.
- Teste no celular: `http://SEU_IP_DA_REDE:3000/health`.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
