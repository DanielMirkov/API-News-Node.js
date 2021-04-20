const Joi = require('joi');
const express = require('express');
const { urlencoded } = require('express');

const app = express();

//middleware piece json
app.use(express.json());

//change date with createdAt
//filtered by date and title
//filter without URI encoding

//http://localhost:3030/api/where?date=1980&sortBy=title=a
//http://localhost:3030/api/where?date=1980
//http://localhost:3030/api/where?title=a

//sortable by date and title 
//sorting wihout URI Encoding
//http://localhost:3030/api/where?sortBy=date=1980&sortBy=title=a
//http://localhost:3030/api/where?sortBy=date=1980
//http://localhost:3030/api/where?sortBy=title=a

const news = [{
        _id: uuid(),
        date: new Date('1995-12-17T03:24:00'),
        title: 'g title',
        description: 'dadaadad',
        text: 'thetawawsa'
    },
    {
        _id: uuid(),
        date: new Date('1965-12-17T03:24:00'),
        title: 'a title',
        description: 'dadaadad',
        text: 'thetawawsa'
    },
    {
        _id: uuid(),
        date: new Date(),
        title: 'c titles',
        description: 'dadaadad',
        text: 'thetawawsa'
    }
]

//INITIAL
app.get('/', (req, res) => {
    //todo
    res.send(news);
});
//GET ALL NEWS
app.get('/api/news', (req, res) => {
    //todo
    res.send(news)
});
//GET BY ID
app.get('/api/news/:id', (req, res) => {
        const article = news.find(a => a._id === req.params.id);
        if (!article) res.status(404).send('The article with given ID does not exist');
        res.send(article);

    })
    //Filtering query
app.get('/api/:query', (req, res) => {

    let articlesFiltered;
    let sortedArticles;

    if (req.query.sortBy) {
        //date from 1950 to 2050 
        //reverse if 2050 to 1950 needed.
        if (req.query.sortBy == 'date') {
            sortedArticles = news.sort((a, b) => a.date - b.date);
            return res.send(sortedArticles);
        }
        if (req.query.sortBy == 'title') {
            sortedArticles = news.sort((a, b) => a.title.localeCompare(b.title));
            return res.send(sortedArticles);
        }
        //title from A to Z
        //title form Z to A reverse needed
        if (req.query.sortBy.length > 1) {
            if (req.query.sortBy[0] == 'date') {
                sortedArticles = news.sort((a, b) => {
                    const titleA = a.title;
                    const dateA = a.date;

                    const titleB = b.title;
                    const dateB = b.date;

                    return dateA - dateB || titleA.localeCompare(titleB);
                });

            }
            if (req.query.sortBy[0] == 'title') {
                sortedArticles = news.sort((a, b) => {
                    const titleA = a.title;
                    const dateA = a.date;

                    const titleB = b.title;
                    const dateB = b.date;

                    return titleA.localeCompare(titleB) || dateA - dateB;

                });
            }
            return res.send(sortedArticles);
        }

    }

    if (req.query.date && req.query.title) {
        articlesFiltered = news.filter(a => a.date.getFullYear() >= req.query.date).filter(a => a.title.localeCompare(req.query.title));
        return res.send(articlesFiltered);
    } else if (req.query.date && !req.query.title) {

        articlesFiltered = news.filter(a => a.date.getFullYear() >= req.query.date);
        return res.send(articlesFiltered);
    } else if (req.query.title && !req.query.date) {
        articlesFiltered = news.filter(a => a.title.localeCompare(req.query.title));
        return res.send(articlesFiltered);
    }


})

//ADDING NEW RECORDS
app.post('/api/news', (req, res) => {
    const result = validateArticle(req.body);

    if (result.message) return res.status(400).send(result.message);

    const article = {
        _id: uuid(),
        date: new Date(Date.now()),
        title: req.body.title,
        description: req.body.description,
        text: req.body.text
    };
    news.push(article);
    res.send(article);
});

//UPDATEING RECORD BY ID
app.put('/api/news/:id', (req, res) => {

    const article = news.find(a => a._id === req.params.id);
    if (!article) res.status(404).send('The article with given ID does not exist');
    ///can only update record with all fields
    const result = validateArticle(req.body);

    if (result.message) return res.status(400).send(result.message);
    ///if not validated
    article.date = new Date(Date.now());
    article.title = req.body.title ? req.body.title : article.title;
    article.description = req.body.description ? req.body.description : article.description;
    article.text = req.body.text ? req.body.text : article.text;

    res.send(article);
});

app.delete('/api/news/:id', (req, res) => {
    //locate item
    const article = news.find(a => a._id === req.params.id);
    if (!article) return res.status(404).send('The article with given ID does not exist');

    const index = news.indexOf(article);
    news.splice(index, 1);
    res.send(article);
});

//validation of body
function validateArticle(article) {
    const schema = Joi.object({
        date: Joi.date().min(1950).max(2050),
        title: Joi.string().min(3).required(),
        description: Joi.string().min(3).required(),
        text: Joi.string().min(10).required(),
    });

    const { error, value } = schema.validate(article);
    return error || value;
}

//ID generator
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
// PORT
const port = process.env.PORT || 3030;
app.listen(port, () => console.log(`Lisening on port ${port}..`))