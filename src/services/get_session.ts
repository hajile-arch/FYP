import supabase from "../utils/supabase";

export const getUserSession = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.log("error getting user session", error);
  } else {
    return data.session?.user;
  }
};
