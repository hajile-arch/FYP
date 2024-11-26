import supabase from "../utils/supabase";

export const createProfile = async (
  student_id: string,
  user_id: string,
  name: string,
  phone_number: string,
  email: string
) => {
  const { error } = await supabase.from("profile").insert({
    student_id: student_id,
    user_id: user_id,
    name: name,
    phone_number: phone_number,
    email: email,
  });

  if (error) {
    console.log("error creating data in profile: ", error);
    return false;
  }
  return true;
};

export const readProfile = async (
  attributes: string,
  field?: string,
  value?: string
) => {
  let query = supabase.from("profile").select(attributes);

  if (field && value) {
    query = query.eq(field, value);
  }

  const { data, error } = await query;

  if (error) {
    console.log("error reading profile: ", error);
    return null;
  }

  if (data) {
    return data;
  } else {
    console.log("no data returned");
  }
};


export const resetPassword = async (value: string, newPass: String) => {
  let query = supabase
  .from("profile")
  .select("*")
  .eq("student_id", value)

  const {data, error} = await query

  if (error) {
    console.log("error reading profile for password reset: ", error);
    return null;
  }

  // use data for oldpassword checking -> if old password checking is same as the one in database ->
  // then update the old password with the new password -> redirect the use to login page
  if(data){
    // if (data[0].password != oldPass) {
    //   console.log("old password is incorect")
    //   return null;
    // }

    let queryChangePassword = supabase.from("profile").update({"password":newPass}).eq("student_id", value)
    
    const {data, error} = await queryChangePassword

    if(error){
      console.log("Error changing password", error)
      return null;
    } else {
      console.log("password updated")
    }

  }

}