Proyecto backend en Node.js + TypeScript (API REST) para gestión de usuarios (registro, login, CRUD).  

Resumen rápido:
- Express (ES Modules)
- Sequelize + MySQL (mysql2)
- Multer para uploads
- JWT para autenticación

Requisitos
- Node.js 18+ (probado con Node 20)
- MySQL
- npm

Instalación y ejecución
````bash
# ir a la carpeta del proyecto
cd e:/Documentos/CURSO-NODEJS/back-node-typescript-02

# instalar dependencias
npm install

# compilar TypeScript
npm run build

# ejecutar en modo producción
npm start

# desarrollo (watch + nodemon sobre dist)
npm run dev

# solo comprobación de tipos
npm run type-check
