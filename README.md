# Lab 3 — Sensores de Hardware con React Native (Expo SDK 55)

Aplicación móvil en React Native que integra **dos sensores del dispositivo** (acelerómetro y giroscopio) para visualizar datos en tiempo real y un mini-juego interactivo que utiliza ambos sensores.

## Descripción

La app cuenta con tres secciones principales:

| Pantalla | Sensor | Descripción |
|---|---|---|
| **Accelerometer** | Acelerómetro | Visualización en tiempo real de los ejes X, Y, Z y magnitud |
| **Gyroscope** | Giroscopio | Velocidad de rotación por eje, dirección dominante |
| **Dragon Slayer** | Ambos | Mini-juego: agitar el teléfono para golpear, inclinar para esquivar |

## Estructura del proyecto

```
lab-3/
├── App.js                    # Navegación principal (state-based)
├── index.js                  # Entry point (Expo)
├── app.json                  # Configuración de Expo
├── package.json
├── constants/
│   └── sensorConfig.js       # Umbrales y constantes de sensores
├── hooks/
│   ├── useAccelerometer.js   # Hook reactivo para el acelerómetro
│   └── useGyroscope.js       # Hook reactivo para el giroscopio
├── screens/
│   ├── HomeScreen.js         # Hub principal con navegación
│   ├── AccelerometerScreen.js # Dashboard del acelerómetro
│   ├── GyroscopeScreen.js    # Dashboard del giroscopio
│   └── DragonSlayerGame.js   # Mini-juego Dragon Slayer
└── assets/                   # Iconos y splash screen
```

## Instrucciones para ejecutar

### Prerrequisitos
- **Node.js** v18 o superior
- **Bun** v1.0 o superior: https://bun.sh
- **Expo Go** instalado en tu dispositivo móvil ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))

### Instalación

```bash
# Clonar el repositorio
git clone (https://github.com/dconejo94/lab-3.git)
cd lab-3/lab-3

# Instalar dependencias
bun install
```

### Ejecución

```bash
# Iniciar el servidor de desarrollo
bunx expo start
```

Escanear el código QR con Expo Go en tu dispositivo móvil.

> **Importante:** Los sensores de hardware (acelerómetro y giroscopio) solo funcionan en dispositivos físicos, no en emuladores/simuladores.

## Cómo jugar Dragon Slayer

1. Desde la pantalla principal, toca **"Dragon Slayer"**
2. Espera a que ambos sensores estén activos (indicadores verdes)
3. Toca **"Enter Battle"**
4. **AGITAR** el teléfono → Golpea al dragón (usa el acelerómetro)
5. Cuando el dragón ataque (pantalla roja) → **INCLINAR** el teléfono para esquivar (usa el giroscopio)
6. ¡Construye combos para hacer más daño!
7. Ganas cuando el HP del dragón llega a 0

## Tecnologías

- **React Native** 0.83.6
- **Expo SDK** 55
- **expo-sensors** ~55.0.15 (Accelerometer + Gyroscope)
- Navegación basada en estado (sin dependencias externas de navegación)

## Sensores integrados

### Acelerómetro (`useAccelerometer`)
- Mide fuerzas de aceleración en ejes X, Y, Z
- En reposo muestra ~1g en un eje (gravedad)
- Detecta sacudidas para el sistema de combate

### Giroscopio (`useGyroscope`)
- Mide velocidad angular (rad/s) en ejes X, Y, Z
- Detecta inclinación/rotación del dispositivo
- Usado para esquivar ataques del dragón

### Ciclo de vida de permisos
1. **Verificación de disponibilidad** → `isAvailableAsync()`
2. **Solicitud de permiso** → `requestPermissionsAsync()`
3. **Suscripción reactiva** → `addListener()` con cleanup en `useEffect`

## Configuración del entorno (Android Studio + Emulator)

Para desarrollo y pruebas del proyecto se utilizó Android Studio + Android Emulator con una configuración ajustada para mejorar estabilidad y evitar cierres por falta de memoria.

### Instalación de herramientas

Verificar instalación de:

- Android Studio
- Android SDK
- Android Emulator
- Android SDK Platform Tools (adb)
- Node.js v18+
- Bun v1+

Verificar que adb esté disponible:

```bash
adb version
```

Verificar dispositivos conectados:

```bash
adb devices
```

### Configuración del Android Virtual Device (AVD)

Abrir:

`Android Studio → Device Manager → Create/Edit Device`

Configuración recomendada:

| Parámetro | Valor |
|---|---|
| Device | Pixel (cualquiera reciente) |
| API Level | Android 16 (API 36) |
| RAM | 4096–6144 MB |
| VM Heap | 512 MB |
| Internal Storage | Default |
| Graphics | Hardware |
| Snapshots | Deshabilitados (recomendado) |

### Ajuste de memoria

Ir a:

`Device Manager → Edit Emulator → Show Advanced Settings`

Cambiar:

- RAM: 4096 MB (mínimo)
- VM Heap: 512 MB

Esto reduce cierres del emulador por presión de memoria.

### Comandos de ejecución

Iniciar proyecto:

```bash
bun install
bunx expo start
```

Abrir directamente en Android Emulator:

```bash
bunx expo start --android
```

Alternativamente:

`a`

desde la terminal interactiva de Expo.

### Comandos útiles de Android Debug Bridge (ADB)

Ver dispositivos:

```bash
adb devices
```

Ver logs del dispositivo:

```bash
adb logcat
```

Filtrar errores de memoria:

```bash
adb logcat | grep lmkd
```

Ver consumo de memoria:

```bash
adb shell dumpsys meminfo
```

Ver memoria de una app específica:

```bash
adb shell dumpsys meminfo <package_name>
```

Reiniciar servidor ADB:

```bash
adb kill-server
adb start-server
```

### Reinicio limpio del emulador (Cold Boot)

Si el emulador presenta:

- pantallas congeladas
- errores de Google Play Services
- cierres inesperados
- lentitud extrema

ejecutar:

`Device Manager → ▼ → Cold Boot Now`

El Cold Boot reinicia completamente el estado del emulador y limpia procesos retenidos.

### Limpieza del emulador (opcional)

Restablecer el dispositivo virtual:

`Device Manager → ▼ → Wipe Data`

Usar únicamente si el emulador queda en estado inconsistente.

> **Nota:** Para esta práctica se recomienda usar dispositivo físico con Expo Go, ya que sensores como acelerómetro y giroscopio tienen soporte limitado o no representan comportamiento real dentro del emulador.

## Autores

- Daniel Conejo Cheves C12243
- Alejandro Barboza Taylor C10886

## Referencias
 Durante todo el desarrollo del proyecto se buscó información en las diapositivas del curso y la herramienta de IA, Claude Sonnet 4.6, para la obtención de información relevante a lo necesario para el desarrollo del mismo y la investigación de soluciones a los errores encontrados durante la ejecución del proyecto.
