var express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

var router = express.Router();

router.get("/user", async (req, res) => {
  try {
    let { response, jsonResponse } = await getFeedByURL(req.query?.id);
    if (response.status === 200) {
      const updatedItems = [];
      await Promise.all(
        jsonResponse?.items.map(async (item) => {
          const stats = await getStatsByURL(item.link);
          item["stats"] = stats;
          if (!item?.thumbnail) {
            item.thumbnail = extractContentBy(item.content, 'src="', '">')
          }
          updatedItems.push(item);
        })
      );
      jsonResponse.items = updatedItems;
      res.status(response.status).send(jsonResponse);
    } else {
      res.status(response.status).send(jsonResponse);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
});

router.get("/feed", async (req, res) => {
  try {
    let { response, jsonResponse } = await getFeedByURL(req.query?.user);
    res.status(response.status).send(jsonResponse);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
});

router.get("/post/stats", async (req, res) => {
  try {
    const url = req.query?.url;
    if (url) {
      if (!url.includes("medium.com")) {
        res.status(400).send("Invalid url request. It must be medium.com");
      }
      const stats = await getStatsByURL(url);
      res.status(200).send(removeEmpty(stats));
    } else {
      res.status(400).send("Invalid request. url param missing.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
});

async function getFeedByURL(username) {
  username = username[0] === "@" ? username : `@${username}`;
  const response = await fetch(
    `https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/${username}`
  );
  const jsonResponse = await response.json();
  return { response, jsonResponse };
}

async function getStatsByURL(url) {
  try {
    const responseText = await (await fetch(url)).text();
    console.log("received content for clap and comment")
    const stats = {
      claps: +extractContentBy(responseText, '"clapCount":', ",") || 0,
      comments: +extractContentBy(responseText, '"count":', "}") || 0,
    };
    return stats;
  } catch (error) {
    console.log("Error while fetching the blog content for clap and comment")
    console.error(error)
  }
}

function extractContentBy(content, firstSplit, secondSplit) {
  if (content) {
    const splits = content.split(firstSplit);
    if (splits.length > 1) {
      const commaSplit = splits[1].split(secondSplit);
      if (commaSplit.length) {
        return commaSplit[0];
      } else {
        console.log(`Second Splitting unsuccessful ${secondSplit} -- ${commaSplit}`)
      }
    } else{
      console.log(`First Splitting unsuccessful ${firstSplit} -- ${splits}`)
    }
  }
  return undefined;
}

const removeEmpty = (obj) => {
  let newObj = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] === Object(obj[key])) newObj[key] = removeEmpty(obj[key]);
    else if (obj[key] !== undefined) newObj[key] = obj[key];
  });
  return newObj;
};

module.exports = router;
