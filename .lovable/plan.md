

# Fix: Redeploy Edge Function `order-emails`

## Problema
Modificările din ultima editare (logica `shouldNotifyAdmin` pentru a trimite emailuri la `andrei@pheres.com` si `stanoiloren20@gmail.com`) nu au fost aplicate. Funcția edge rulează o versiune veche -- dovadă: logul `"Received payload:"` nu apare deloc.

## Soluția
1. **Redeploy** funcția `order-emails` pentru a activa codul actualizat
2. **Verificare** prin loguri că noua logică funcționează (ar trebui să vedem `"Sending admin notification to:"` la comenzi plătite)

## Ce se va întâmpla după deploy
- La orice comandă cu status `paid`, funcția va trimite automat email de notificare la ambii admini
- Emailurile la clienți continuă să funcționeze normal
- Nu sunt necesare alte modificări de cod -- codul este deja corect în repository

