# What is Weather Panel and why was it created?

Weather Panel is an open source client-based weather display meant to provide a quick yet informative view of your local weather. It pulls in data from Weather Underground for general current conditions and future forecast and from Dark Sky to provide a view of the near-term probability of storming in your area.

The project begins as a "scratch your own itch" endeavor for its original author (me). The first copy of it is meant for use with a Raspberry Pi and a second-hand display to act as a weather control panel for a small farm. It is also an exercise in presenting raw data in a fun and engaging way. I hope others enjoy it and find it useful for their own itches.

# How do I get started?

Fork the weather-panel respository, obtain API keys from Weather Underground and Dark Sky, get the latitude and longitude of the location you'd like to track the weather for, and input them into the variables atop the script.js file. Then, just load the index.htm file into your favorite browser.

# Where do I obtain API keys for Weather Underground and Dark Sky?

Weather Underground: [http://www.wunderground.com/weather/api/](http://www.wunderground.com/weather/api)
Dark Sky: [http://developer.darkskyapp.com](http://developer.darkskyapp.com)

# What's an easy way to find my location's latitude and longitude?

Using Google Maps: [http://support.google.com/maps/bin/answer.py?hl=en&answer=18539](http://support.google.com/maps/bin/answer.py?hl=en&answer=18539)

# Do the API's cost anything to use?

Weather Underground and Dark Sky both offer a free tier for the API services utilized in Weather Panel. Note their API call limits and set the timeouts in Weather Panel accordingly. They are easy enough to find in the code, currently, and future commits will include more handily exposed settings for managing your API calls from any given running copy. Note that no billing information is required by either service for use of their API's and by default, when you hit their caps, your requests will simply be denied.

# Can I use the code for my own projects?

Sure. Weather Panel is distributed under the MIT License. Use it as you'd like under those conditions.

More about the MIT License: [http://en.wikipedia.org/wiki/MIT_License](http://en.wikipedia.org/wiki/MIT_License)

# Anything else I should be aware of?

Yeah, just be careful about not sharing your API keys. They are meant for you, so if you redistribute code, make sure you remove them. Also, once again, keep an eye on the number of API calls you have scheduled running in Weather Panel to avoid running out too early in the day.

Have fun!