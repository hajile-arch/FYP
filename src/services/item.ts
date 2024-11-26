import supabase from "../utils/supabase";
import { readItemCategory } from "./item_category";

export const readItem = async (attributes: string, category_name: string) => {
  const item_category = await readItemCategory(
    "category_id",
    "category_name",
    category_name
  );

  if (!item_category || !item_category[0]?.category_id) {
    throw new Error("category_id not found");
  }

  const category_id = item_category[0].category_id;

  if (!category_id) {
    throw new Error("category_name not found");
  }

  const { data, error } = await supabase
    .from("item")
    .select(attributes)
    .eq("category_id", category_id);

  if (error) {
    console.log("error reading item: ", error);
  } else {
    return data;
  }
};

export const readAllItems = async (attributes: string) => {
  const { data, error } = await supabase.from("item").select(attributes);

  if (error) {
    console.log("error reading data from item");
  } else {
    return data || [];
  }
};

export const readItemName = async (item_id: string) => {
  const { data, error } = await supabase
    .from("item")
    .select("item_name")
    .eq("item_id", item_id);

  if (error) {
    console.log("error reading name from item", error);
  } else {
    return data || null;
  }
};
