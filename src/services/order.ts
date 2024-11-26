import supabase from "../utils/supabase";

export const readOrder = async (
  attributes: string,
  field?: string,
  value?: string
) => {
  let query = supabase.from("order").select(attributes);

  if (field && value) {
    query = query.eq(field, value);
  }

  const { data, error } = await query;

  if (error) {
    console.log("error reading order: ", error);
    return [];
  }

  return data || [];
};

export const createOrder = async (from_user_id: string, location: string) => {
  const { data, error } = await supabase
    .from("order")
    .insert([
      {
        from_user_id: from_user_id,
        location: location,
        status: "Pending",
      },
    ])
    .select();

  if (error) {
    console.log("error creating order: ", error);
    return null;
  } else {
    if (data) {
      return data[0].order_id;
    } else {
      console.log("no data returned");
      return null;
    }
  }
};

export const deleteOrder = async (field: string, value: string) => {
  const { error } = await supabase.from("order").delete().eq(field, value);
  if (error) {
    console.log("error removing data in order", error);
  }
};

export const updateOrder = async (
  status: string,
  student_id: string,
  field: string,
  value: string
) => {
  const { error } = await supabase
    .from("order")
    .update({ status: status, to_user_id: student_id })
    .eq(field, value);

  if (error) {
    console.log("error updating data in order", error);
  }
};
