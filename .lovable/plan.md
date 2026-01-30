
## Remove Couture Collections from Shop and Fix Links

### Problem
1. The mega menu links Couture child collections (like "Red Carpet Pieces") to `/shop/collection/red-carpet-pieces`, which uses the standard `Collection.tsx` page that shows price filters
2. Couture collections should only be accessible via `/couture/:slug` route (which already hides price filters)
3. Couture products should not appear in the regular shop experience at all

---

### Solution

#### 1. Update CollectionsMegaMenu Links
Change Couture child collection links from `/shop/collection/${slug}` to `/couture/${slug}`:

**Desktop menu (line 144):**
- Current: `/shop/collection/${child.slug}`
- Change to: `/couture/${child.slug}`

**Mobile menu (line 275):**
- Current: `/shop/collection/${child.slug}`
- Change to: `/couture/${child.slug}`

#### 2. Add Redirect in Collection Page
To prevent direct access via `/shop/collection/:slug` for Couture collections, add a redirect check in `Collection.tsx` that:
- Detects if the collection is a Couture type (by checking `collection_type === "couture"`)
- Redirects the user to `/couture/${slug}` instead

---

### File Changes

| File | Changes |
|------|---------|
| `src/components/layout/CollectionsMegaMenu.tsx` | Update links for Couture children to use `/couture/` path (2 locations) |
| `src/pages/Collection.tsx` | Add redirect logic for Couture collections to `/couture/:slug` |

---

### Technical Details

```text
CollectionsMegaMenu.tsx changes:

Line 144:
- to={`/shop/collection/${child.slug}`}
+ to={`/couture/${child.slug}`}

Line 275:
- to={`/shop/collection/${child.slug}`}
+ to={`/couture/${child.slug}`}
```

```text
Collection.tsx changes:

Add useNavigate hook and useEffect to detect couture collections
and redirect to /couture/:slug automatically.
```

---

### Result After Changes
- Mega menu links to Couture collections will go to `/couture/red-carpet-pieces` (no price filters)
- Direct access to `/shop/collection/red-carpet-pieces` will auto-redirect to `/couture/red-carpet-pieces`
- Couture products remain completely separate from the `/shop` page experience
