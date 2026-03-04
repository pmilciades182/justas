# Mecánicas de Combate — Justa Real

Este documento detalla el funcionamiento interno del sistema de combate, las probabilidades de impacto y las sinergias entre habilidades escaladas por nivel de equipo.

## 1. Probabilidades de Desmonte (Caída)
La probabilidad de desmontar al oponente depende de la ronda actual (venida), el estado de salud del defensor y las habilidades activas.

### Probabilidad Base por Ronda
| Ronda | Probabilidad Base |
| :--- | :--- |
| **1ª Venida** | 5% |
| **2ª Venida** | 10% |
| **3ª Venida** | 30% |
| **4ª Venida** | 60% |

### Bonificadores Adicionales
- **Salud Baja**: Se suma hasta un **+25%** de probabilidad si el defensor tiene 0 HP.
- **Sinergia de Velocidad (vs Escudo)**: Escala con el **Tier del Caballo**.
    - Fórmula: `+10% + (Tier * 4%)`
    - Tier 1: **+14%** | Tier 5: **+30%**

---

## 2. Sistema de Habilidades (Piedra-Papel-Tijeras)
Las habilidades tienen un sistema de contraataque cuyo poder depende del **Tier (Nivel)** del equipamiento.

| Habilidad Atacante | Habilidad Defensor | Resultado |
| :--- | :--- | :--- |
| **Ataque (Rojo)** | **Velocidad (Amarillo)** | **Ataque Gana**: Daño extra según Tier de Lanza (`+30% + Tier*10%`). <br>Tier 1: **+40%** | Tier 5: **+80%** |
| **Velocidad (Amarillo)** | **Defensa (Azul)** | **Velocidad Gana**: Prob. desmonte extra según Tier de Caballo (`+10% + Tier*4%`). <br>Tier 1: **+14%** | Tier 5: **+30%** |
| **Ataque (Rojo)** | **Defensa (Azul)** | **Igualado**: Ambas habilidades se anulan entre sí. Solo se aplican sus stats base. |
| **Estándar / Vel.** | **Defensa (Azul)** | **Defensa Gana**: El atacante queda aturdido según Tier de Escudo. <br>T1-2: **1 ronda** | T3-4: **2 rondas** | T5: **3 rondas** |

---

## 3. Estados Alterados y Salud
- **Salud (HP)**:
    - Menos de 25% HP: **-3 Fuerza**.
    - Menos de 50% HP: **-2 Fuerza**.
    - Menos de 75% HP: **-1 Fuerza**.
    - **0 HP**: El caballero queda **aturdido permanentemente** hasta que reciba curación.
- **Aturdimiento (Stun)**:
    - El caballero no puede usar Guardia Alta (reduce precisión y daño).
    - Reduce la fuerza en **-2**.
    - El caballero no puede activar habilidades mientras está aturdido.
- **Congelación (Freeze)**:
    - Inmoviliza al caballero según la **duración de la armadura** (3s a 7.2s).
    - Cancela cualquier habilidad activa del caballero afectado.
    - Reduce la fuerza a **0** mientras dura el efecto.

---

## 4. Multiplicadores de Daño
El daño final se calcula según la velocidad de impacto:
- **Velocidad de Impacto**: Suma de la velocidad de ambos caballeros.
- **Multiplicador**: Escala hasta un máximo de **2.2x** a máxima velocidad.
- **Mitigación**: El **Escudo (Defensa)** reduce el daño recibido a la **mitad (50%)**.

---

## 5. Inteligencia Artificial (IA)
El adversario reacciona dinámicamente y con conocimiento de Tiers:
1. **Prioridad 1**: Curación si tiene menos de 35% HP.
2. **Prioridad 2 (Counter)**: Si usas Ataque, la IA usará Defensa para igualar.
3. **Prioridad 3 (Counter)**: Si usas Defensa, la IA usará Velocidad para perforar tu escudo.
4. **Prioridad 4 (Tactical)**: Usará Congelación para anular tus habilidades activas de alto nivel.
