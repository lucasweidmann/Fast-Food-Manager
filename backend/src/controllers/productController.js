import { supabase, supabaseAuth } from "../config/supabase.js";

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

function unauthorized(res, message = "Não autenticado") {
  return res.status(401).json({ error: message });
}

function forbidden(res, message = "Sem permissão") {
  return res.status(403).json({ error: message });
}

function notFound(res, message = "Registro não encontrado") {
  return res.status(404).json({ error: message });
}

function internalError(res, error) {
  console.error(error);
  return res.status(500).json({
    error: error?.message || "Erro interno do servidor",
  });
}

function getToken(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim();
}

async function authenticateRequest(req) {
  const token = getToken(req);

  if (!token) {
    return { error: { message: "Token não enviado" } };
  }

  const { data, error } = await supabaseAuth.auth.getUser(token);

  if (error || !data?.user) {
    return { error: { message: "Token inválido" } };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,name")
    .eq("id", data.user.id)
    .maybeSingle();

  return {
    user: {
      id: data.user.id,
      email: data.user.email || "",
      role: profile?.role ?? "customer",
      name: profile?.name || "",
    },
  };
}

function allow(user) {
  return ["admin", "staff"].includes(user.role);
}

function sanitize(body) {
  return {
    category_id:
      body.category_id === null || body.category_id === undefined
        ? null
        : Number(body.category_id),
    name: String(body.name || "").trim(),
    description: String(body.description || "").trim(),
    price: Number(body.price),
    image_url: body.image_url ? String(body.image_url).trim() : null,
    active: typeof body.active === "boolean" ? body.active : true,
  };
}

function validate(p) {
  if (!p.name) return "Nome obrigatório";
  if (!Number.isFinite(p.price) || p.price < 0) return "Preço inválido";
  return null;
}

export async function getProducts(req, res) {
  try {
    let canSeeInactive = false;

    const token = getToken(req);
    if (token) {
      const auth = await authenticateRequest(req);
      if (!auth.error) {
        canSeeInactive = allow(auth.user);
      }
    }

    const showAll = req.query.all === "true";

    let query = supabase.from("products").select("*").order("id");

    if (!(showAll && canSeeInactive)) {
      query = query.eq("active", true);
    }

    const { data, error } = await query;

    if (error) return internalError(res, error);
    return res.json(data);
  } catch (e) {
    return internalError(res, e);
  }
}

export async function createProduct(req, res) {
  try {
    const auth = await authenticateRequest(req);
    if (auth.error) return unauthorized(res, auth.error.message);
    if (!allow(auth.user)) return forbidden(res);

    const payload = sanitize(req.body);
    const err = validate(payload);
    if (err) return badRequest(res, err);

    const { data, error } = await supabase
      .from("products")
      .insert([payload])
      .select()
      .single();

    if (error) return internalError(res, error);
    return res.status(201).json(data);
  } catch (e) {
    return internalError(res, e);
  }
}

export async function updateProduct(req, res) {
  try {
    const auth = await authenticateRequest(req);
    if (auth.error) return unauthorized(res, auth.error.message);
    if (!allow(auth.user)) return forbidden(res);

    const { id } = req.params;
    const payload = sanitize(req.body);
    const err = validate(payload);
    if (err) return badRequest(res, err);

    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", Number(id))
      .select()
      .maybeSingle();

    if (error) return internalError(res, error);
    if (!data) return notFound(res);

    return res.json(data);
  } catch (e) {
    return internalError(res, e);
  }
}

export async function toggleProductStatus(req, res) {
  try {
    const auth = await authenticateRequest(req);
    if (auth.error) return unauthorized(res, auth.error.message);
    if (!allow(auth.user)) return forbidden(res);

    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== "boolean") {
      return badRequest(res, "active inválido");
    }

    const { data, error } = await supabase
      .from("products")
      .update({ active })
      .eq("id", Number(id))
      .select()
      .maybeSingle();

    if (error) return internalError(res, error);
    if (!data) return notFound(res);

    return res.json(data);
  } catch (e) {
    return internalError(res, e);
  }
}
