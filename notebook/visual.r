
library(readr)
dat <- read.csv(file="./data/All_tornadoes_with_headers.csv", header=TRUE, sep=",")

head(dat)

dat$Month[dat$Month == 1] <- "January"
dat$Month[dat$Month == 2] <- "February"
dat$Month[dat$Month == 3] <- "March"
dat$Month[dat$Month == 4] <- "April"
dat$Month[dat$Month == 5] <- "May"
dat$Month[dat$Month == 6] <- "June"
dat$Month[dat$Month == 7] <- "July"
dat$Month[dat$Month == 8] <- "August"
dat$Month[dat$Month == 9] <- "September"
dat$Month[dat$Month == 10] <- "Octomber"
dat$Month[dat$Month == 11] <- "November"
dat$Month[dat$Month == 12] <- "December"

head(dat)

# Before 1996
dat$Losses[dat$Losses == 0 ] <- NA
dat$Losses[dat$Losses == 1 & dat$Year < 1996] <- "<$50"
dat$Losses[dat$Losses == 2 & dat$Year < 1996] <- "$50-$500"
dat$Losses[dat$Losses == 3 & dat$Year < 1996] <- "$500-$5,000"
dat$Losses[dat$Losses == 4  & dat$Year < 1996] <- "$5,000-$50,000"
dat$Losses[dat$Losses == 5 & dat$Year < 1996] <- "$50,000-$500,000"
dat$Losses[dat$Losses == 6 & dat$Year < 1996] <- "$500,000-$5,000,000"
dat$Losses[dat$Losses == 7 & dat$Year < 1996] <- "$5,000,000-$50,000,000"
dat$Losses[dat$Losses == 8  & dat$Year < 1996] <- "$50,000,000-$500,000,000"
dat$Losses[dat$Losses == 9 & dat$Year < 1996] <- ">$500,000,000"

# After 1996
dat$Losses[dat$Losses >= 0 & dat$Losses < 0.0005 & dat$Year >= 1996] <- "<$50"
dat$Losses[dat$Losses >= 0.00005 & dat$Losses < 0.0005 & dat$Year >= 1996] <- "$50-$500"
dat$Losses[dat$Losses >= 0.0005 & dat$Losses < 0.005 & dat$Year >= 1996] <- "$500-$5,000"
dat$Losses[dat$Losses >= 0.005 & dat$Losses < 0.05 & dat$Year >= 1996] <- "$5,000-$50,000"
dat$Losses[dat$Losses >= 0.05 & dat$Losses < 0.5 & dat$Year >= 1996] <- "$50,000-$500,000"
dat$Losses[dat$Losses >= 0.5 & dat$Losses < 5 & dat$Year >= 1996] <- "$500,000-$5,000,000"
dat$Losses[dat$Losses >= 5 & dat$Losses < 50 & dat$Year >= 1996] <- "$5,000,000-$50,000,000"
dat$Losses[dat$Losses >= 50 & dat$Losses < 500 & dat$Year >= 1996] <- "$50,000,000-$500,000,000"
dat$Losses[dat$Losses >= 500 & dat$Year >= 1996] <- ">$500,000,000"

# set subset
newdata <- subset(dat,select=c(Date, State, Losses)) 
head(newdata)

# view summary 
summary(subset(dat,select=c(Date, State, Losses)))

dat$'Crop.loss'[dat$'Crop.loss' == 0] <- NA

dat$'Length.miles.'[dat$'Length.miles.' == 0] <- NA

dat$'Width.yards.'[dat$'Width.yards.' == 0] <- NA

newdata <- subset(dat,select=c(Date, State, Crop.loss,Length.miles. , Width.yards.)) 
head(newdata)

library(ggplot2)

## Use ggplot2 to create conditioned scatter plots
numCols <- c( 'Length.miles.','Width.yards.' )
fscale.scatter <- function(df, cols){
  require(ggplot2)
  for(col in cols){
    p1 <- ggplot(df, aes_string(x = col, y = "F.Scale")) + 
            geom_point(aes( color = 'Injuries')) +  
            geom_smooth(method = "loess") + 
            ggtitle(paste('F.Scale vs. ', col)) +
            theme(text = element_text(size=16))
    print(p1)
  }
}

fscale.scatter(dat[1:4000,], numCols)

catCols <- c('Year', 'Month', 'State','Losses')
tornadoes.box <- function(df, cols){
  require(ggplot2)
  for(col in cols){
    p1 <- ggplot(df, aes_string(x = col, y = 'F.Scale', group = col)) +
            geom_boxplot()+ 
            ggtitle(paste('F.Scale vs. ', col)) +
            theme(text = element_text(size=16))
    print(p1)
  }
}

tornadoes.box(dat, catCols)
