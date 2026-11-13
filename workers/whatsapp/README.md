# Prueba de respuesta automática de WhatsApp

El Worker de prueba responde a `prueba mariachi` desde un solo celular autorizado y para un único número emisor de Meta.

## Cloudflare

Con Wrangler autenticado en la cuenta de la empresa, ejecuta desde la raíz:

```sh
npx --yes wrangler@4.159.0 deploy --config workers/whatsapp/wrangler.jsonc
```

En el Worker **aymariachi-whatsapp-test**, abre **Settings → Variables and Secrets** y agrega estos valores como secretos:

| Nombre | Valor |
| --- | --- |
| `META_APP_SECRET` | App Secret de la aplicación en Meta, en **App settings → Basic**. |
| `WA_VERIFY_TOKEN` | Cadena aleatoria que creas para verificar el webhook. Usa el mismo valor en Meta. |
| `WA_ACCESS_TOKEN` | Token de acceso del panel **WhatsApp → API Setup** para el número de prueba. |
| `WA_PHONE_NUMBER_ID` | **Phone number ID** del número de prueba, tal como aparece en API Setup. |
| `WA_GRAPH_API_VERSION` | Versión indicada en el ejemplo cURL de Meta, con formato `vNN.N`. |
| `WA_TEST_RECIPIENT` | Celular que recibió `hello_world`, en formato internacional de dígitos. Usa el identificador de WhatsApp del destinatario, `wa_id`, si lo muestra la respuesta de Meta. |

## Meta

En **WhatsApp → Configuration**, registra la URL que mostró Wrangler seguida de `/webhooks/whatsapp`. Pega el mismo `WA_VERIFY_TOKEN`, pulsa **Verify and save** y suscribe el campo `messages` de la cuenta de WhatsApp Business de prueba. Si la aplicación no está suscrita a la cuenta de WhatsApp Business de prueba, suscríbela desde la configuración de Meta o por el endpoint `/{WABA-ID}/subscribed_apps`.

Desde el celular que recibió `hello_world`, responde **prueba mariachi** a ese mismo chat. Debe llegar el acuse automático. El número público de la web y el número de prueba de Meta tienen funciones distintas. Para conectar el número oficial a Cloud API, verifica primero qué modalidad de alta corresponde a esa línea.

El Worker valida la firma de Meta y evita que los reintentos del mismo evento generen respuestas duplicadas durante ocho días. Si una llamada a Graph queda en estado incierto, se conserva la marca para evitar duplicados. Para repetir una prueba, manda un mensaje nuevo. Las credenciales se guardan en Cloudflare.
