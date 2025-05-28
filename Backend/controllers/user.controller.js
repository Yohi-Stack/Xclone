import User from "../models/user.model.js";
import Notification from "../models/notify.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "cloudinary";

// getProfile
export const getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      res.status(400).json({ error: "Username is invalid" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log(`Error in getProfile controller : ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// followUnfollow
export const followUnfollow = async (req, res) => {
  try {
    const { id } = req.params;
    const userModify = await User.findById({ _id: id });
    const currentUser = await User.findById({ _id: req.user._id });
  
    if (id === req.user._id) {
      return res.status(400).json({ error: "you can't follow or Unfollow" });
    }

    if (!userModify || !currentUser) {
      return res.status(404).json({ error: "User not Found" });
    }

    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      //unfollow
      await User.findByIdAndUpdate(
        { _id: id },
        { $pull: { followers: req.user._id } }
      );
      await User.findByIdAndUpdate(
        { _id: req.user._id },
        { $pull: { following: id } }
      );

      res.status(200).json({ message: "Unfollowed successfully" });
    } else {
      //follow
      await User.findByIdAndUpdate(
        { _id: id },
        { $push: { followers: req.user._id } }
      );
      await User.findByIdAndUpdate(
        { _id: req.user._id },
        { $push: { following: id } }
      );
      // send notification
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userModify._id,
      });
      await newNotification.save();
      res.status(200).json({ message: "Followed Successfully" });
    }
  } catch (error) {
    console.log(`Error in follow&Unfollow controller : ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//Suggested users
export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const userFollowedByMe = await User.findById({ _id: userId._id }).select(
      "-password"
    );

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: {
          size: 10,
        },
      },
    ]);

    const filteredUser = users.filter(
      (user) => !userFollowedByMe.following.includes(user._id)
    );
    const suggestedUsers = filteredUser.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));
    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log(`Error in SuggestedUsers controller : ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// UpdateUser
export const updateUser = async (req, res) => {
  const userId = req.user._id;
  const { username, fullName, email, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImg, coverImg } = req.body;

  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // if (
    //   (!newPassword && currentPassword) ||
    //   (!currentPassword && newPassword)
    // ) {
    //   return res.status(400).json({ error: "Please provide both Password " });
    // }
    // if (currentPassword && newPassword) {
    //   const isMatch = await bcrypt.compare(currentPassword, user.password);
    //   if (!isMatch) {
    //     return res.status(400).json({ error: "Current password is Incorrect" });
    //   }
    //   if (newPassword.length < 6) {
    //     return res
    //       .status(400)
    //       .json({ error: "Pasword must have atleast 6 characters" });
    //   }
    //   const salt = await bcrypt.genSalt(10);
    //   user.password = await bcrypt.hash(newPassword, salt);

// Handle password update
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Please provide both passwords" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

// REPLACED CLOUDINARY CODE
     
      // Upload profile image if provided
    if (profileImg) {
      if (user.profileImg?.includes("cloudinary")) {
        const publicId = user.profileImg.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      const uploadRes = await cloudinary.uploader.upload(profileImg);
      user.profileImg = uploadRes.secure_url;
    }

    // Upload cover image if provided
    if (coverImg) {
      if (user.coverImg?.includes("cloudinary")) {
        const publicId = user.coverImg.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      const uploadRes = await cloudinary.uploader.upload(coverImg);
      user.coverImg = uploadRes.secure_url;
    }

      // Update other fields
      user.username = username || user.username;
      user.fullName = fullName || user.fullName;
      user.email = email || user.email;
      user.bio = bio || user.bio;
      user.link = link || user.link;
      user.profileImg = profileImg || user.profileImg;
      user.coverImg = coverImg || user.coverImg;

      user = await user.save();
      //password is null in res
      user.password = undefined;
      return res.status(200).json(user);
    }
   catch (error) {
    console.log(`Error in updateUser controller : ${error}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


 //   if (profileImg) {
      //     if (user.profileImg) {
      // // https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png

      //       await cloudinary.uploader.destroy(
      //         user.profileImg.split("/").pop().split(".")[0]
      //       );
      //     }

      //     const uploadedRespose = await cloudinary.uploader.upload(profileImg);
      //     profileImg = uploadedRespose.secure_url;
      //   }
      //   if (coverImg) {
      //     if (user.coverImg) {
      //         await cloudinary.uploader.destroy(
      //           user.coverImg.split("/").pop().split(".")[0]
      //         );
      //       }
      //     const uploadedRespose = await cloudinary.uploader.upload(coverImg);
      //     coverImg = uploadedRespose.secure_url;
      //   }