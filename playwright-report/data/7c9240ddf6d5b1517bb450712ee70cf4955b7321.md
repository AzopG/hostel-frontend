# Page snapshot

```yaml
- generic [ref=e5]:
  - generic [ref=e6]:
    - heading "Iniciar Sesión" [level=2] [ref=e7]
    - paragraph [ref=e8]: Accede a tu cuenta del sistema hotelero
  - generic [ref=e9]:
    - generic [ref=e10]:
      - generic [ref=e11]: Email
      - textbox "Email" [ref=e12]: test@example.com
    - generic [ref=e13]:
      - generic [ref=e14]: Contraseña
      - textbox "Contraseña" [ref=e15]: password123
    - button "Iniciando sesión..." [disabled] [ref=e16]: Iniciando sesión...
  - paragraph [ref=e19]:
    - text: ¿No tienes cuenta?
    - link "Regístrate aquí" [ref=e20] [cursor=pointer]:
      - /url: "#"
```