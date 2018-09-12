import React from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import ethereumRegex from 'ethereum-regex';

import Theme from '../components/Theme';
import Layout from '../index.js'
import Header from '../components/Header'
import Stats from '../components/Stats';
import Bounties from '../components/Bounties';
import StyledAppWrapper from './StyledAppWrapper';
import StyledPageContentWrapper from './StyledPageContentWrapper';
import Footer from '../components/Footer';

import { Footer as FooterDetails, BountiesPerPage } from '../constants';
import GithubApi from '../api/github';

export default class Home extends React.Component{

  state = {
    sideBar: false,
    stats: [{
        name:"Total Value of Fund",
        loadingSize: "130"
      }, {
        name: "Total Payout",
        loadingSize: "130"
      }, {
        name: "Open Tasks",
        loadingSize: "50"
      }, {
        name: "Completed Tasks",
        loadingSize: "50"
      }, {
        name: "No. of Contributors",
        loadingSize: "50"
      }],
      orderBy: "Most recent",
      selectedCategory: "Development",
      categories: [],
      currentPage: 0,
      showCompletedTasks: true,
  }

  componentDidMount = () => {
    this.getIssues();
  }

  setCurrentPage = currentPage => {
    this.setState({currentPage})
  }

  handleOrderByClicked = orderBy => {
    this.setState({orderBy})
  }

  handleShowCompletedTasks = showCompletedTasks => {
    this.setState({showCompletedTasks})
  }

  handleClickedFilter = (name, checked) => {
    let tmpIssues = Object.assign({}, this.state.issues);
    tmpIssues[this.state.selectedCategory].filters[name] = checked;
    this.setState({issues: tmpIssues});
  }

  setCategory = selectedCategory => {
    if(this.state.selectedCategory !== selectedCategory){
      this.setState({selectedCategory, currentPage: 0})
    }
  }

  setStats = async (completedTasks, openTasks) => {
    let stats = await GithubApi.getStats();
    stats = [{
        name:"Total Value of Fund",
        value: stats.totalValue,
        loadingSize: "130"
      }, {
        name: "Total Payout",
        value: stats.totalPayout,
        loadingSize: "130"
      }, {
        name: "Open Tasks",
        value: openTasks,
        loadingSize: "50"
      }, {
        name: "Completed Tasks",
        value: completedTasks,
        loadingSize: "50"
      }, {
        name: "No. of Contributors",
        value: stats.contributors,
        loadingSize: "50"
      }
    ]

    this.setState({stats});
  }

   /*
   * this method splits issues by categories and also sets it up so that
   + its easy to handle the state of each filter
   */
   organizeIssues = (issues) => {
      let completedTasks = 0;
      let openTasks = 0;
      let processedIssues = {};
      let categories = [];
      //isues that don't have a bounty
      issues = issues.filter(issue => issue.contractAddress != -1);

      issues.forEach(issue => {
        const category = issue.category;
        if(!processedIssues[category]){
          processedIssues[category] = {issues: [issue], filters:{}};
          categories.push(category);
        }
        else{
          processedIssues[category].issues.push(issue);
        }
        if(!issue.merged){
          openTasks += 1;
        }
        else{
          completedTasks += 1;
        }
        issue.labels.forEach(label => {
          //if the user has toggled the filter off before then let it be
          if(this.state.issues && this.state.issues[category] && this.state.isssues[category].filters[label] === false){
            processedIssues[category].filters[label] = false;
          }
          else if(processedIssues[category].filters[label] === undefined){
            //filters always start off as checked
            processedIssues[category].filters[label] = true;
          }
        })
      });

      this.setStats(completedTasks, openTasks);
      this.setState({issues: processedIssues, categories})
   }

  getCategory = (repoName) => {
    if(repoName.indexOf("tech") !== -1 || repoName.indexOf("website") !== -1)
      return "Development";
    else if(repoName.indexOf("design") !== -1){
      return "Design";
    }
    else if(repoName.indexOf("marketing") !== -1)
      return "Marketing";
    else
      return "Development";
  }

  getIssues = async () => {
    try{
      let issues = await GithubApi.getOrgIssues()
      issues = issues.map((issue, index) => {
        const {labels, repoName, contractAddress, tokenSymbol, value, title, createdAt, merged, url} = issue;
        const category = this.getCategory(repoName);

        return {
          createdAt,
          merged,
          repoName,
          labels,
          category,
          contractAddress,
          value,
          tokenSymbol,
          title,
          url,
          repoUrl: `https://github.com/MyBitFoundation/${repoName}`,
        }
      })

      this.organizeIssues(issues);

    }catch(err){
      setTimeout(this.getIssues, 2000);
    }
   }

  handleClickMobileMenu = (sideBar) => {
    this.setState({sideBar});
  }

  render(){
    const {loadingBounties} = this.state;
    return(
      <Layout>
        <StyledAppWrapper isMenuOpen={this.state.sideBar}>
          <Header
            styling={Theme}
            handleClickMobileMenu={this.handleClickMobileMenu}
            sidebarOpen={this.state.sideBar}
          />
          <Stats stats={this.state.stats}/>
          <StyledPageContentWrapper>
            <Bounties
              styling={Theme}
              issues={this.state.issues}
              categories={this.state.categories}
              selectedCategory={this.state.selectedCategory}
              setCategory={this.setCategory}
              handleClickedFilter={this.handleClickedFilter}
              showCompletedTasks={this.state.showCompletedTasks}
              handleShowCompletedTasks={this.handleShowCompletedTasks}
              bountiesPerPage={BountiesPerPage}
              currentPage={this.state.currentPage}
              setCurrentPage={this.setCurrentPage}
              orderBy={this.state.orderBy}
              handleOrderByClicked={this.handleOrderByClicked}
            />
          </StyledPageContentWrapper>
        </StyledAppWrapper>
        <Footer
          styling={Theme.footer}
          footerDetails={FooterDetails}
        />
      </Layout>
    )
  }
}
