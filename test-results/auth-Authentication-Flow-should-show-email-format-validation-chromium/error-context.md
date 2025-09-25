# Page snapshot

```yaml
- generic [ref=e5]:
  - generic [ref=e6]:
    - heading "Iniciar Sesión" [level=2] [ref=e7]
    - paragraph [ref=e8]: Accede a tu cuenta del sistema hotelero
  - generic [ref=e9]:
    - generic [ref=e10]:
      - generic [ref=e11]: Email
      - textbox "Email" [ref=e12]: invalid-email
      - generic [ref=e14]: Formato de email inválido
    - generic [ref=e15]:
      - generic [ref=e16]: Contraseña
      - textbox "Contraseña" [active] [ref=e17]: password123
    - button "Iniciar Sesión" [disabled] [ref=e18]
  - paragraph [ref=e20]:
    - text: ¿No tienes cuenta?
    - link "Regístrate aquí" [ref=e21] [cursor=pointer]:
      - /url: "#"
```